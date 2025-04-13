import type { PageProps } from "waku/router";
import { sql } from "../../shared/db";
import { PostType } from "../../shared/types";
import { Header } from "../../shared/header";
import { MarkdownWithImagePreview } from "../../shared/MarkdownImageWithPreview";
import { PostDeleter } from "../../shared/AdminComponents";

async function Post({ id }: PageProps<"/post/[id]">) {
  const postData: PostType[] = await sql`
    SELECT p.id, p.title, p.content, p.created_at, p.slug,
           COALESCE(json_agg(t.name) FILTER (WHERE t.id IS NOT NULL), '[]') AS tags
    FROM posts p
    LEFT JOIN post_tags pt ON p.id = pt.post_id
    LEFT JOIN tags t ON pt.tag_id = t.id
    WHERE p.id = ${id}
    GROUP BY p.id, p.title, p.content, p.created_at, p.slug`;

  async function deletePost(_post: PostType) {
    "use server";

    await sql`
      DELETE FROM posts
      WHERE id = ${_post.id}`;

    await sql`
      DELETE FROM post_tags
      WHERE post_id = ${_post.id}`;
  }

  const post = postData[0]!;

  // fix date going forward, maybe offset old ones
  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div className="flex flex-col max-w-[600px] mx-auto">
      <Header />
      <div
        className="bg-hard-black relative text-left post px-[1lh] py-[1lh]"
        key={post.id}
        id={post.slug}
      >
        <div className="justify-between">
          <div className="relative pointer-events-none">
            <div className="blue">
              {dateFormatter
                .format(
                  new Date(
                    new Date(post.created_at).getTime() - 1000 * 60 * 60 * 4,
                  ),
                )
                .toLocaleString()}
            </div>
            <PostDeleter deletePost={deletePost} post={post} />
          </div>
          <div className="orange">
            {post.tags.map((tag) => (
              <a
                href={`/tag/${tag}`}
                className="pointer-events-auto hover:underline"
                key={tag}
              >
                {tag}
              </a>
            ))}
          </div>
          <div className="green mb-[1lh]">{post.title}</div>
          <MarkdownWithImagePreview post={post} content={post.content} />
        </div>
      </div>
    </div>
  );
}

export default Post;


// export const getConfig = async () => {
//   return {
//     render: 'static',
//   } as const;
// };
