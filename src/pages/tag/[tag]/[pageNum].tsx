import type { PageProps } from "waku/router";
import { sql } from "../../../shared/db";
import { PostType } from "../../../shared/types";
import { PostPagination } from "../../../shared/PostPagination";
import TruncatedPostLink from "../../../shared/TruncatedPostLink";
import { Header } from "../../../shared/header";

async function TagPage({
  tag,
  pageNum = "1",
}: PageProps<"/tag/[tag]/[pageNum]">) {
  const limit = 20;
  const page = parseInt(pageNum);
  const offset = (page - 1) * limit;

  const posts: PostType[] = await sql`
    SELECT p.id, p.title, p.content, p.created_at, p.slug,
           COALESCE(json_agg(t.name) FILTER (WHERE t.id IS NOT NULL), '[]') AS tags
    FROM posts p
    LEFT JOIN post_tags pt ON p.id = pt.post_id
    LEFT JOIN tags t ON pt.tag_id = t.id
    WHERE t.name = ${tag}
    GROUP BY p.id, p.title, p.content, p.created_at, p.slug
    ORDER BY p.created_at DESC
    LIMIT ${limit} OFFSET ${offset}`;

  const postCountData = await sql`
    SELECT COUNT(*) AS count
    FROM posts p
    LEFT JOIN post_tags pt ON p.id = pt.post_id
    LEFT JOIN tags t ON pt.tag_id = t.id
    WHERE t.name = ${tag}`;

  const tagPostCount = postCountData[0]!.count;
  const totalPages = Math.ceil(tagPostCount / limit);

  return (
    <div className="container">
      <Header />
      <div className="tag-header">
        <span>{tag}</span>
        <span>{tagPostCount} posts</span>
      </div>
      {totalPages > 1 && (
        <PostPagination
          baseLink={`/tag/${tag}/`}
          page={page}
          totalPostCount={tagPostCount}
          postsOnPage={posts.length}
        />
      )}
      <div className="feed">
        {posts.map((post) => (
          <TruncatedPostLink key={post.slug} post={post} />
        ))}
      </div>
      {totalPages > 1 && (
        <PostPagination
          baseLink="/page/"
          page={page}
          totalPostCount={tagPostCount}
          postsOnPage={posts.length}
        />
      )}
    </div>
  );
}

export default TagPage;

export const getConfig = async () => {
  return {
    render: "dynamic",
  } as const;
};
