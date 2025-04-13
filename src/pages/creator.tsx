import { sql } from "../shared/db";
import { PostEditor } from "../shared/PostEditor";
import { PostType } from "../shared/types";
import { makeDBTimestamp } from "../shared/dateFormatter";

async function Post() {
  const blankPost = {
    id: 0,
    title: "",
    content: "",
    slug: "",
    created_at: new Date(),
    tags: [],
  } as PostType;

  async function createPost(_post: PostType, adminPassword: string): Promise<void> {
    "use server";

    if (adminPassword !== process.env.ADMIN_PASSWORD) return;

    const dbTimestamp = makeDBTimestamp(_post.created_at);

    const idData = await sql`
      INSERT INTO posts (title, content, slug, created_at, updated_at)
      VALUES (${_post.title}, ${_post.content}, ${_post.slug}, ${dbTimestamp}, ${dbTimestamp})
      RETURNING id`;

    const id = idData[0]!.id;

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
        VALUES (${id}, ${tagId})
        ON CONFLICT (post_id, tag_id) DO NOTHING`;
    }
  }

  return <PostEditor post={blankPost} updatePost={createPost} />;
}

export default Post;

export const getConfig = async () => {
  return {
    render: "dynamic",
  } as const;
};
