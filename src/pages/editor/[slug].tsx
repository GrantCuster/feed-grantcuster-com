import type { PageProps } from "waku/router";
import { sql } from "../../shared/db";
import { PostType } from "../../shared/types";
import { PostEditor } from "../../shared/PostEditor";
import { makeDBTimestamp } from "../../shared/dateFormatter";

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

  async function updatePost(_post: PostType, adminPassword: string): Promise<void> {
    "use server";

    if (adminPassword !== process.env.ADMIN_PASSWORD) return;

    const dbTimestamp = makeDBTimestamp(_post.created_at);

    await sql`
      UPDATE posts
      SET title = ${_post.title}, content = ${_post.content}, slug = ${_post.slug}, created_at = ${dbTimestamp}, updated_at = ${dbTimestamp}
      WHERE id = ${_post.id}`;

    const originalTags = await sql`
      SELECT t.name
      FROM posts p
      LEFT JOIN post_tags pt ON p.id = pt.post_id
      LEFT JOIN tags t ON pt.tag_id = t.id
      WHERE p.slug = ${post.slug}`;

    // Extract current tag names
    const currentTagNames = _post.tags;

    for (const tag of currentTagNames) {
      let tagId;

      // Ensure the tag exists in the 'tags' table
      const tagRecord = await sql`
        INSERT INTO tags (name)
        VALUES (${tag})
        ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
        RETURNING id`;

      tagId = tagRecord[0]!.id;

      // Ensure the association exists in 'post_tags'
      await sql`
        INSERT INTO post_tags (post_id, tag_id)
        VALUES (${post.id}, ${tagId})
        ON CONFLICT (post_id, tag_id) DO NOTHING`;
    }

    // Delete tags that are no longer associated (if necessary)
    for (const { name: originalTagName } of originalTags) {
      if (!currentTagNames.includes(originalTagName)) {
        await sql`
          DELETE FROM post_tags
          WHERE post_id = ${post.id} AND tag_id = (
            SELECT id FROM tags WHERE name = ${originalTagName}
          )`;
      }
    }
  }

  return <PostEditor post={post} updatePost={updatePost} />;
}

export default Post;

export const getConfig = async () => {
  return {
    render: "dynamic",
  } as const;
};
