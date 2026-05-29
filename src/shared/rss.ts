import { micromark } from "micromark";
import { gfm, gfmHtml } from "micromark-extension-gfm";
import { sql } from "./db";
import type { PostType } from "./types";

const siteUrl = "https://feed.grantcuster.com";
const feedUrl = `${siteUrl}/rss.xml`;

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function cdata(value: string) {
  return `<![CDATA[${value.replaceAll("]]>", "]]]]><![CDATA[>")}]]>`;
}

function postTitle(post: PostType) {
  if (post.title) return post.title;

  return post.tags.length ? post.tags.join(", ") : `Post ${post.id}`;
}

function postDescription(post: PostType) {
  return post.content
    .replaceAll(/!\[([^\]]*)]\([^)]*\)/g, "$1")
    .replaceAll(/\[([^\]]+)]\([^)]*\)/g, "$1")
    .replaceAll(/<[^>]*>/g, " ")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 3)
    .join(" ");
}

function addImageCaptions(html: string) {
  return html.replace(
    /<p><img\s+src="([^"]*)"\s+alt="([^"]+)"\s*\/><\/p>/g,
    (_match, src: string, alt: string) =>
      `<figure style="display:block;margin:0 0 1rem 0;"><img src="${src}" alt="${alt}" style="display:block;max-width:100%;height:auto;" /><figcaption style="display:block;margin-top:0.35rem;">${alt}</figcaption></figure>`,
  );
}

function normalizeVideoFigures(html: string) {
  return html
    .replaceAll(
      /<p>\s*(<video\b[^>]*>[\s\S]*?<\/video>)\s*<em>\s*<\/em>\s*<\/p>/g,
      '<figure style="display:block;margin:0 0 1rem 0;">$1</figure>',
    )
    .replaceAll(
      /<p>\s*(<video\b[^>]*>[\s\S]*?<\/video>)\s*<em>([\s\S]*?)<\/em>\s*<\/p>/g,
      '<figure style="display:block;margin:0 0 1rem 0;">$1<figcaption style="display:block;margin-top:0.35rem;">$2</figcaption></figure>',
    )
    .replaceAll(
      /<p>\s*(<video\b[^>]*>[\s\S]*?<\/video>)\s*<\/p>/g,
      '<figure style="display:block;margin:0 0 1rem 0;">$1</figure>',
    );
}

function stackMedia(html: string) {
  return html
    .replaceAll(
      /<video\b(?![^>]*\bstyle=)([^>]*)>/g,
      '<video style="display:block;width:auto;max-width:100%;height:auto;margin:0 0 1rem 0;"$1>',
    )
    .replaceAll(
      /<img\b(?![^>]*\bstyle=)([^>]*)>/g,
      '<img style="display:block;max-width:100%;height:auto;"$1>',
    );
}

function addVideoFallbackLinks(html: string) {
  return html.replaceAll(
    /(<video\b[^>]*\bsrc="([^"]+)"[^>]*>[\s\S]*?<\/video>)/g,
    (_match, video: string, src: string) =>
      `${video}<p><a href="${escapeXml(src)}">View video</a></p>`,
  );
}

function renderPostContent(post: PostType, link: string) {
  const html = micromark(post.content, {
    allowDangerousHtml: true,
    extensions: [gfm()],
    htmlExtensions: [gfmHtml()],
  });

  const content = addVideoFallbackLinks(
    stackMedia(normalizeVideoFigures(addImageCaptions(html))),
  );

  return `${content}
<p><a href="${escapeXml(link)}">Read on site</a></p>`;
}

export async function buildRssFeed() {
  const posts = await sql<PostType[]>`
    SELECT p.id, p.title, p.content, p.created_at, p.slug,
           COALESCE(json_agg(t.name) FILTER (WHERE t.id IS NOT NULL), '[]') AS tags
    FROM posts p
    LEFT JOIN post_tags pt ON p.id = pt.post_id
    LEFT JOIN tags t ON pt.tag_id = t.id
    GROUP BY p.id, p.title, p.content, p.created_at, p.slug
    ORDER BY p.created_at DESC
    LIMIT 50
  `;

  const latestPostDate = posts[0]?.created_at ?? new Date();

  const items = posts
    .map((post) => {
      const link = `${siteUrl}/post/${post.slug}`;

      return `
    <item>
      <title>${escapeXml(postTitle(post))}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <pubDate>${post.created_at.toUTCString()}</pubDate>
      <description>${cdata(postDescription(post))}</description>
      <content:encoded>${cdata(renderPostContent(post, link))}</content:encoded>
      ${post.tags.map((tag) => `<category>${escapeXml(tag)}</category>`).join("\n      ")}
    </item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Feed - Grant Custer</title>
    <link>${siteUrl}</link>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
    <description>Making and inspiration in progress</description>
    <language>en-us</language>
    <lastBuildDate>${latestPostDate.toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>
`;
}
