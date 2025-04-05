import type { PageProps } from "waku/router";
import { sql } from "../../shared/db";
import { PostType } from "../../shared/types";
import { PostEditor } from "../../shared/PostEditor";

async function Post({ slug }: PageProps<"/post/[slug]">) {
  const postData: PostType[] = await sql`
    SELECT p.id, p.title, p.content, p.created_at, p.slug,
           COALESCE(json_agg(t.name) FILTER (WHERE t.id IS NOT NULL), '[]') AS tags
    FROM posts p
    LEFT JOIN post_tags pt ON p.id = pt.post_id
    LEFT JOIN tags t ON pt.tag_id = t.id
    WHERE p.slug = ${slug}
    GROUP BY p.id, p.title, p.content, p.created_at, p.slug`;

  const post = postData[0]!;

  async function updatePost(_post: PostType) {
    "use server";

    await sql`
      UPDATE posts
      SET title = ${_post.title}, content = ${_post.content}, slug = ${_post.slug}
      WHERE id = ${_post.id}`;
  }

  return <PostEditor post={post} updatePost={updatePost} />;
}

export default Post;

export const getConfig = async () => {
  return {
    render: "dynamic",
  } as const;
};
