import type { PageProps } from "waku/router";
import { sql } from "../shared/db";
import { PostType } from "../shared/types";
import { Header } from "../shared/header";

async function RandomPost() {
  const postData: PostType[] = await sql`
    SELECT p.slug
    FROM posts p
    ORDER BY RANDOM()
    LIMIT 1`;

  const post = postData[0]!;

  // redirect to the post page
  if (post) {
    const url = `/post/${post.slug}`;
    return (
      <>
      <script
        dangerouslySetInnerHTML={{
          __html: `window.location.href = "${url}";`,
        }}
      />
    <Header />
    </>
    );
  }

  return null;
}

export default RandomPost;
