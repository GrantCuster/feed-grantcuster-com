import { sql } from "./db";
import { postsPerPage } from "./consts";
import type { PostType } from "./types";

export type FeedCursor = { createdAt: string; id: number };
export type FeedPost = Omit<PostType, "created_at"> & { created_at: string };
export type FeedPage = { posts: FeedPost[]; nextCursor: FeedCursor | null };

export async function getFeedPage({ cursor, tag, offset = 0 }: {
  cursor?: FeedCursor;
  tag?: string | undefined;
  offset?: number;
} = {}): Promise<FeedPage> {
  const rows = await sql<(PostType & { cursor_timestamp: string })[]>`
    SELECT p.id, p.title, p.content, p.created_at, p.slug,
           p.created_at::text AS cursor_timestamp,
           COALESCE(json_agg(t.name) FILTER (WHERE t.id IS NOT NULL), '[]') AS tags
    FROM posts p
    LEFT JOIN post_tags pt ON p.id = pt.post_id
    LEFT JOIN tags t ON pt.tag_id = t.id
    WHERE TRUE
    ${cursor ? sql`AND (p.created_at, p.id) < (${cursor.createdAt}::text::timestamp, ${cursor.id})` : sql``}
    ${tag === undefined ? sql`` : sql`AND EXISTS (
      SELECT 1 FROM post_tags filter_pt JOIN tags filter_t ON filter_t.id = filter_pt.tag_id
      WHERE filter_pt.post_id = p.id AND filter_t.name = ${tag}
    )`}
    GROUP BY p.id, p.title, p.content, p.created_at, p.slug
    ORDER BY p.created_at DESC, p.id DESC
    LIMIT ${postsPerPage + 1} OFFSET ${offset}
  `;
  const page = rows.slice(0, postsPerPage);
  const last = page[page.length - 1];
  return {
    posts: page.map(({ cursor_timestamp, ...post }) => ({ ...post, created_at: post.created_at.toISOString() })),
    nextCursor: rows.length > postsPerPage && last
      ? { createdAt: last.cursor_timestamp, id: last.id }
      : null,
  };
}
