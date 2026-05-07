import { GoogleGenAI } from "@google/genai";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { getVectorSql, sql, toVectorLiteral } from "./db";

const embeddingModel = "gemini-embedding-2";
const mediaDescriptionModel = "gemini-2.5-flash";

const IMAGE_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

const VIDEO_MIME: Record<string, string> = {
  mp4: "video/mp4",
  mov: "video/quicktime",
  webm: "video/webm",
};

type SyncPost = {
  id: number;
  title: string | null;
  content: string;
  updated_at: Date;
};

type MediaType = "image" | "gif" | "video" | "unknown";

type MediaDescription = {
  url: string;
  description: string;
};

class MediaFetchError extends Error {
  status: number;

  constructor(status: number, url: string) {
    super(`HTTP ${status} for ${url}`);
    this.status = status;
  }
}

let aiClient: GoogleGenAI | null | undefined;

function getAiClient() {
  if (aiClient !== undefined) {
    return aiClient;
  }

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  aiClient = apiKey ? new GoogleGenAI({ apiKey }) : null;
  return aiClient;
}

function getMediaType(url: string): MediaType {
  const ext = url.split("?")[0].split(".").pop()?.toLowerCase() ?? "";
  if (ext === "gif") return "gif";
  if (ext in IMAGE_MIME) return "image";
  if (ext in VIDEO_MIME) return "video";
  return "unknown";
}

function getMediaKind(url: string): string {
  const type = getMediaType(url);
  if (type === "gif") return "GIF";
  if (type === "video") return "VIDEO";
  return "IMAGE";
}

function getExt(url: string): string {
  return url.split("?")[0].split(".").pop()?.toLowerCase() ?? "";
}

type MarkdownMediaMatch = {
  full: string;
  url: string;
};

export function extractMarkdownMediaMatches(content: string): MarkdownMediaMatch[] {
  const matches: MarkdownMediaMatch[] = [];
  let searchFrom = 0;

  while (searchFrom < content.length) {
    const imageStart = content.indexOf("![", searchFrom);
    if (imageStart === -1) break;

    const urlStart = content.indexOf("](", imageStart);
    if (urlStart === -1) break;

    let cursor = urlStart + 2;
    let parenDepth = 0;

    while (cursor < content.length) {
      const char = content[cursor];
      if (char === "(") {
        parenDepth += 1;
      } else if (char === ")") {
        if (parenDepth === 0) break;
        parenDepth -= 1;
      }
      cursor += 1;
    }

    if (cursor >= content.length) break;

    const url = content.slice(urlStart + 2, cursor);
    if (/^https?:\/\//.test(url)) {
      matches.push({
        full: content.slice(imageStart, cursor + 1),
        url,
      });
    }

    searchFrom = cursor + 1;
  }

  return matches;
}

export function parseMediaUrls(content: string): string[] {
  const urls: string[] = [];
  for (const match of extractMarkdownMediaMatches(content)) {
    urls.push(match.url);
  }
  for (const match of content.matchAll(/src=["'](https?:\/\/[^\s"']+)["']/g)) {
    urls.push(match[1]!);
  }
  return [...new Set(urls)].filter((url) => url.includes("amazonaws.com"));
}

function buildEnrichedContent(post: Pick<SyncPost, "title" | "content">, descMap: Map<string, string>) {
  let content = post.title ? `${post.title}\n\n${post.content}` : post.content;

  for (const match of extractMarkdownMediaMatches(content)) {
    const description = descMap.get(match.url);
    const replacement = description ? `[${getMediaKind(match.url)}: ${description}]` : "";
    content = content.replace(match.full, replacement);
  }

  content = content.replace(
    /<video[^>]*src=["'](https?:\/\/[^\s"']+)["'][^>]*>.*?<\/video>/gs,
    (_, url) => {
      const description = descMap.get(url);
      if (!description) return "";
      return `[VIDEO: ${description}]`;
    },
  );

  return content.trim();
}

async function fetchBuffer(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new MediaFetchError(response.status, url);
  }
  return Buffer.from(await response.arrayBuffer());
}

async function describeImage(ai: GoogleGenAI, url: string): Promise<string> {
  const ext = getExt(url);
  const mimeType = IMAGE_MIME[ext] ?? "image/jpeg";
  const data = (await fetchBuffer(url)).toString("base64");
  const result = await ai.models.generateContent({
    model: mediaDescriptionModel,
    contents: [
      {
        role: "user",
        parts: [
          { inlineData: { mimeType, data } },
          {
            text: "Describe this image concisely and specifically. Focus on what is shown, any text visible, and what it communicates. 2-4 sentences.",
          },
        ],
      },
    ],
  });
  return result.text ?? "";
}

async function describeVideo(ai: GoogleGenAI, filePath: string, mimeType: string): Promise<string> {
  const uploaded = await ai.files.upload({
    file: filePath,
    config: { mimeType },
  });

  let file = await ai.files.get({ name: uploaded.name! });
  while (file.state === "PROCESSING") {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    file = await ai.files.get({ name: uploaded.name! });
  }
  if (file.state === "FAILED") {
    throw new Error("Gemini file processing failed");
  }

  const result = await ai.models.generateContent({
    model: mediaDescriptionModel,
    contents: [
      {
        role: "user",
        parts: [
          { fileData: { mimeType, fileUri: file.uri! } },
          {
            text: "Describe this video or animation concisely and specifically. Focus on what is shown, any text visible, and what it demonstrates or communicates. 2-4 sentences.",
          },
        ],
      },
    ],
  });

  await ai.files.delete({ name: uploaded.name! });
  return result.text ?? "";
}

async function processVideo(ai: GoogleGenAI, url: string): Promise<string> {
  const ext = getExt(url);
  const mimeType = VIDEO_MIME[ext] ?? "video/mp4";
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "feed-video-"));
  const videoPath = path.join(tempDir, `input.${ext}`);
  try {
    const buffer = await fetchBuffer(url);
    fs.writeFileSync(videoPath, buffer);
    return await describeVideo(ai, videoPath, mimeType);
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

async function describeMedia(ai: GoogleGenAI, url: string) {
  const type = getMediaType(url);
  if (type === "image") return describeImage(ai, url);
  if (type === "video") return processVideo(ai, url);
  return null;
}

async function embedText(ai: GoogleGenAI, text: string) {
  const result = await ai.models.embedContent({
    model: embeddingModel,
    contents: text,
  });
  const values = result.embeddings?.[0]?.values;
  if (!values?.length) {
    throw new Error("Embedding response did not include vector values");
  }
  return values;
}

export async function reembedPostById(postId: number) {
  const ai = getAiClient();
  if (!ai) {
    throw new Error("GEMINI_API_KEY is required for embedding sync");
  }

  const vectorSql = getVectorSql();
  const posts = await sql<SyncPost[]>`
    SELECT id, title, content, updated_at
    FROM posts
    WHERE id = ${postId}
    LIMIT 1
  `;
  const post = posts[0];

  if (!post) {
    throw new Error(`Post ${postId} not found`);
  }

  const mediaUrls = parseMediaUrls(post.content);
  const cachedMedia = mediaUrls.length
    ? await vectorSql<MediaDescription[]>`
        SELECT url, description
        FROM media_descriptions
        WHERE url = ANY(${mediaUrls})
      `
    : [];
  const cachedMediaMap = new Map(cachedMedia.map((row) => [row.url, row.description]));
  const enrichedContent = buildEnrichedContent(post, cachedMediaMap);
  const embedding = await embedText(ai, enrichedContent);

  await vectorSql`
    INSERT INTO post_embeddings (post_id, embedding, embedded_at)
    VALUES (${post.id}, ${toVectorLiteral(embedding)}::vector, NOW())
    ON CONFLICT (post_id) DO UPDATE SET
      embedding = EXCLUDED.embedding,
      embedded_at = EXCLUDED.embedded_at
  `;

  return {
    postId: post.id,
    mediaCount: mediaUrls.length,
  };
}

export async function syncEmbeddings() {
  const ai = getAiClient();
  if (!ai) {
    throw new Error("GEMINI_API_KEY is required for embedding sync");
  }

  const vectorSql = getVectorSql();
  const posts = await sql<SyncPost[]>`
    SELECT id, title, content, updated_at
    FROM posts
    ORDER BY id
  `;

  const uniqueMediaUrls = new Set<string>();
  for (const post of posts) {
    for (const url of parseMediaUrls(post.content)) {
      uniqueMediaUrls.add(url);
    }
  }

  const cachedMedia = await vectorSql<MediaDescription[]>`
    SELECT url, description
    FROM media_descriptions
  `;
  const cachedMediaMap = new Map(cachedMedia.map((row) => [row.url, row.description]));
  const pendingMediaUrls = [...uniqueMediaUrls].filter((url) => !cachedMediaMap.has(url));

  let mediaSynced = 0;
  let mediaSkipped = 0;
  let mediaErrors = 0;

  for (const url of pendingMediaUrls) {
    try {
      const description = await describeMedia(ai, url);
      if (!description) {
        await vectorSql`
          INSERT INTO media_descriptions (url, description)
          VALUES (${url}, ${""})
          ON CONFLICT (url) DO UPDATE SET
            description = EXCLUDED.description,
            created_at = NOW()
        `;
        cachedMediaMap.set(url, "");
        mediaSkipped += 1;
        continue;
      }

      await vectorSql`
        INSERT INTO media_descriptions (url, description)
        VALUES (${url}, ${description})
        ON CONFLICT (url) DO UPDATE SET
          description = EXCLUDED.description,
          created_at = NOW()
      `;
      cachedMediaMap.set(url, description);
      mediaSynced += 1;
    } catch (error) {
      if (error instanceof MediaFetchError && (error.status === 403 || error.status === 404)) {
        console.warn(`Skipping inaccessible media ${url} (${error.status})`);
        await vectorSql`
          INSERT INTO media_descriptions (url, description)
          VALUES (${url}, ${""})
          ON CONFLICT (url) DO UPDATE SET
            description = EXCLUDED.description,
            created_at = NOW()
        `;
        cachedMediaMap.set(url, "");
        mediaSkipped += 1;
      } else {
        console.error(`Media sync failed for ${url}`, error);
        mediaErrors += 1;
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  const existingEmbeddings = await vectorSql<{ post_id: number; embedded_at: Date }[]>`
    SELECT post_id, embedded_at
    FROM post_embeddings
  `;
  const embeddingMap = new Map(existingEmbeddings.map((row) => [row.post_id, row.embedded_at]));
  const pendingPosts = posts.filter((post) => {
    const embeddedAt = embeddingMap.get(post.id);
    return !embeddedAt || new Date(post.updated_at).getTime() > new Date(embeddedAt).getTime();
  });

  let postsSynced = 0;
  let postErrors = 0;

  for (const post of pendingPosts) {
    const enrichedContent = buildEnrichedContent(post, cachedMediaMap);

    try {
      const embedding = await embedText(ai, enrichedContent);
      await vectorSql`
        INSERT INTO post_embeddings (post_id, embedding, embedded_at)
        VALUES (${post.id}, ${toVectorLiteral(embedding)}::vector, NOW())
        ON CONFLICT (post_id) DO UPDATE SET
          embedding = EXCLUDED.embedding,
          embedded_at = EXCLUDED.embedded_at
      `;
      postsSynced += 1;
    } catch (error) {
      console.error(`Post embedding sync failed for ${post.id}`, error);
      postErrors += 1;
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  return {
    mediaFound: uniqueMediaUrls.size,
    mediaPending: pendingMediaUrls.length,
    mediaSynced,
    mediaSkipped,
    mediaErrors,
    postsChecked: posts.length,
    postsPending: pendingPosts.length,
    postsSynced,
    postErrors,
  };
}
