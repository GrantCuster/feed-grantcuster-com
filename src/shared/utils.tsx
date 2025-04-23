import slugify from "slugify";
import { PostType } from "./types";

// async load image
export async function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.src = src;
    image.onload = () => resolve(image);
    image.onerror = reject;
  });
}

export function makeSlug(text: string) {
  return slugify(text, {
    lower: true, // Convert to lowercase
    strict: true, // Remove special characters
    replacement: "-", // Replace spaces with hyphens (default)
  });
}

export function makePostExcerpt(post: PostType) {
  let stripped = post.content
    .replace(/!\[.*\]\(.*\)/g, "")
    .replace(/\*/g, "")
    .replace(/#/g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .slice(0, 2)
    .join("\n");

  // Change markdown links to: text (link)
  const markdownLinks = stripped.match(/\[.*\]\(.*\)/g);
  if (markdownLinks) {
    for (const link of markdownLinks) {
      const parts = link.slice(1, -1).split("](");
      if (parts.length === 2) {
        if (parts[1]!.startsWith("http")) {
          stripped = stripped.replace(link, parts[0] + " (" + parts[1] + ")");
        } else {
          stripped = stripped.replace(link, parts[0] as string);
        }
      }
    }
  }

  // strip out blank lines
  stripped = stripped
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .join("\n");

  return stripped;
}

export function makeSocialShare(post: PostType) {
  let status = "🌱 ";
  if (post.tags.length > 0) {
    status += post.tags[0] + ": ";
  }
  status += post.title + "\n";
  status += makePostExcerpt(post) + "\n";
  let truncated = status.slice(0, 300);
  return truncated;
}
