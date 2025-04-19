import { sql } from "../../shared/db";
import { PostType } from "../../shared/types";
import { PageProps } from "waku/router";
import TruncatedPostLink from "../../shared/TruncatedPostLink";
import { PostPagination } from "../../shared/PostPagination";
import { Header } from "../../shared/header";

export default async function PostPage({
  pageNum = "1",
}: PageProps<"/page/[pageNum]">) {
  const limit = 20;
  const page = parseInt(pageNum);
  const offset = (page - 1) * limit;

  const posts: PostType[] = await sql`
    SELECT p.id, p.title, p.content, p.created_at, p.slug,
           COALESCE(json_agg(t.name) FILTER (WHERE t.id IS NOT NULL), '[]') AS tags
    FROM posts p
    LEFT JOIN post_tags pt ON p.id = pt.post_id
    LEFT JOIN tags t ON pt.tag_id = t.id
    GROUP BY p.id, p.title, p.content, p.created_at, p.slug
    ORDER BY p.created_at DESC
    LIMIT ${limit} OFFSET ${offset}`;

  const postCountData = await sql`
    SELECT COUNT(*) AS count
    FROM posts`;

  const totalPostCount = postCountData[0]!.count;

  return (
    <>
      <title>Feed</title>
      <meta name="description" content="Making and inspiration in progress" />
      <div className="flex flex-col max-w-[600px] mx-auto">
        <Header postCount={totalPostCount} />
        {page !== 1 ? (
          <PostPagination
            baseLink="/page/"
            page={page}
            totalPostCount={totalPostCount}
            postsOnPage={posts.length}
          />
        ) : null}
        <div className="flex flex-col gap-[2px] mb-[2px]">
          {posts.map((post) => (
            <TruncatedPostLink key={post.slug} post={post} />
          ))}
        </div>
        <PostPagination
          baseLink="/page/"
          page={page}
          totalPostCount={totalPostCount}
          postsOnPage={posts.length}
        />
      </div>
    </>
  );
}

export const getConfig = async () => {
  return {
    render: "dynamic",
  } as const;
};
