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

type MediaType = "image" | "gif" | "video" | "unknown";

type MarkdownMediaMatch = {
  full: string;
  url: string;
};

export function getMediaType(url: string): MediaType {
  const ext = url.split("?")[0].split(".").pop()?.toLowerCase() ?? "";
  if (ext === "gif") return "gif";
  if (ext in IMAGE_MIME) return "image";
  if (ext in VIDEO_MIME) return "video";
  return "unknown";
}

export function getMediaKind(url: string): string {
  const type = getMediaType(url);
  if (type === "gif") return "GIF";
  if (type === "video") return "VIDEO";
  return "IMAGE";
}

export function getExt(url: string): string {
  return url.split("?")[0].split(".").pop()?.toLowerCase() ?? "";
}

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
