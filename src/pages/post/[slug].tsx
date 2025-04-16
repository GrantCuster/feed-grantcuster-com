import type { PageProps } from "waku/router";
import { sql } from "../../shared/db";
import { PostType } from "../../shared/types";
import { Header } from "../../shared/header";
import { MarkdownWithImagePreview } from "../../shared/MarkdownImageWithPreview";
import {
  AdminWrapper,
  EditLink,
  PostDeleter,
  ShareToBluesky,
  ShareToMastodon,
  ShareToTwitter,
} from "../../shared/AdminComponents";
import { dateToReadableString } from "../../shared/dateFormatter";
import { createRestAPIClient } from "masto";
import { makeSocialShare } from "../../shared/utils";

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

  console.log(post);

  const title =
    post.tags[0] +
    " " +
    (post.title || "on " + dateToReadableString(post.created_at)) +
    " - Grant's Garden";
  const description = post.content
    .split("\n")
    .slice(0, 3)
    .map((line) => line.trim())
    .join(" ");
  const firstImage = post.content.match(/!\[.*?\]\((.*?)\)/);
  const imageUrl = firstImage
    ? firstImage[1]
    : "https://garden.grantcuster.com/images/og-image.png";

  async function deletePost(_post: PostType, adminPassword: string) {
    "use server";

    if (adminPassword !== process.env.ADMIN_PASSWORD) return;

    await sql`
      DELETE FROM posts
      WHERE id = ${_post.id}`;

    await sql`
      DELETE FROM post_tags
      WHERE post_id = ${_post.id}`;
  }

  async function shareToMastodon(status: string, adminPassword: string) {
    "use server";

    if (adminPassword !== process.env.ADMIN_PASSWORD) return false;

    const client = createRestAPIClient({
      url: "https://mastodon.social",
      accessToken: process.env.MASTODON_ACCESS_TOKEN!,
    });

    await client.v1.statuses.create({
      status,
      visibility: "public",
    });

    return true;
  }

  return (
    <>
      <>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta
          property="og:url"
          content={`https://garden.grantcuster.com/post/${slug}`}
        />
        <meta property="og:image" content={imageUrl} />
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:image" content={imageUrl} />
      </>
      <div className="flex flex-col max-w-[600px] mx-auto">
        <Header />
        <div
          className="bg-hard-black relative text-left post px-[1lh] py-[1lh]"
          key={post.id}
          id={post.slug}
        >
          <div className="relative pointer-events-none">
            <div className="w-full flex justify-between">
              <div className="blue">
                {post.created_at && dateToReadableString(post.created_at)}
              </div>
              <div className="flex gap-3">
                <PostDeleter deletePost={deletePost} post={post} />
                <EditLink post={post} />
              </div>
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
            <AdminWrapper>
              <div className="flex flex-col items-start">
                <ShareToMastodon
                  post={post}
                  shareToMastodon={shareToMastodon}
                />
                <ShareToBluesky
                  post={post}
                  title={title.trim()}
                  description={description.trim()}
                  imageUrl={imageUrl}
                />
                <ShareToTwitter post={post} />
              </div>
            </AdminWrapper>
          </div>
        </div>
      </div>
    </>
  );
}

export default Post;
