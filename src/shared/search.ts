import { GoogleGenAI } from "@google/genai/node";
import { getVectorSql, sql, toVectorLiteral } from "./db";
import { PostType } from "./types";

let aiClient: GoogleGenAI | null | undefined;
const embeddingCache = new Map<string, number[]>();
const maxEmbeddingCacheSize = 200;

function getAiClient() {
  if (aiClient !== undefined) {
    return aiClient;
  }

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  aiClient = apiKey ? new GoogleGenAI({ apiKey }) : null;
  return aiClient;
}

export type SearchPostPayload = Omit<PostType, "created_at"> & {
  created_at: string;
};

function serializePost(post: PostType): SearchPostPayload {
  return {
    ...post,
    created_at: new Date(post.created_at).toISOString(),
  };
}

export function deserializeSearchPost(post: SearchPostPayload): PostType {
  return {
    ...post,
    created_at: new Date(post.created_at),
  };
}

function getCachedEmbedding(query: string) {
  const cached = embeddingCache.get(query);
  if (!cached) {
    return null;
  }

  // Refresh insertion order for simple LRU behavior.
  embeddingCache.delete(query);
  embeddingCache.set(query, cached);
  return cached;
}

function setCachedEmbedding(query: string, embedding: number[]) {
  if (embeddingCache.has(query)) {
    embeddingCache.delete(query);
  }

  embeddingCache.set(query, embedding);

  if (embeddingCache.size > maxEmbeddingCacheSize) {
    const oldestKey = embeddingCache.keys().next().value;
    if (oldestKey) {
      embeddingCache.delete(oldestKey);
    }
  }
}

async function searchPosts(query: string, limit = 20, offset = 0): Promise<PostType[]> {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) {
    return [];
  }

  const ai = getAiClient();
  if (!ai) {
    throw new Error("GEMINI_API_KEY is required for search");
  }

  const cacheKey = normalizedQuery.toLowerCase();
  let queryVectorValues = getCachedEmbedding(cacheKey);

  if (!queryVectorValues) {
    const result = await ai.models.embedContent({
      model: "gemini-embedding-2",
      contents: normalizedQuery,
    });

    queryVectorValues = result.embeddings?.[0]?.values ?? null;
    if (queryVectorValues?.length) {
      setCachedEmbedding(cacheKey, queryVectorValues);
    }
  }

  if (!queryVectorValues?.length) {
    return [];
  }

  const vectorSql = getVectorSql();
  const queryVector = toVectorLiteral(queryVectorValues);

  const topMatches = await vectorSql<{ post_id: number }[]>`
    SELECT post_id
    FROM post_embeddings
    ORDER BY embedding <=> ${queryVector}::vector
    OFFSET ${offset}
    LIMIT ${limit}
  `;

  const ids = topMatches.map(({ post_id }) => post_id);
  if (ids.length === 0) {
    return [];
  }

  const posts = await sql<PostType[]>`
    SELECT p.id, p.title, p.content, p.created_at, p.slug,
           COALESCE(json_agg(t.name) FILTER (WHERE t.id IS NOT NULL), '[]') AS tags
    FROM posts p
    LEFT JOIN post_tags pt ON p.id = pt.post_id
    LEFT JOIN tags t ON pt.tag_id = t.id
    WHERE p.id = ANY(${ids})
    GROUP BY p.id, p.title, p.content, p.created_at, p.slug
  `;

  const postMap = new Map(posts.map((post) => [post.id, post]));

  return topMatches
    .map(({ post_id }) => postMap.get(post_id))
    .filter((post): post is PostType => Boolean(post));
}

export async function searchPostsWithHasMore(query: string, limit = 20, offset = 0) {
  const requestedLimit = Math.max(1, Math.floor(limit));
  const requestedOffset = Math.max(0, Math.floor(offset));
  const posts = await searchPosts(query, requestedLimit + 1, requestedOffset);

  return {
    posts: posts.slice(0, requestedLimit),
    hasMore: posts.length > requestedLimit,
  };
}

export async function searchPostsPage(query: string, limit = 20, offset = 0) {
  const result = await searchPostsWithHasMore(query, limit, offset);

  return {
    posts: result.posts.map(serializePost),
    hasMore: result.hasMore,
  };
}
