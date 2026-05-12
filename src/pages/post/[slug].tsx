import type { PageProps } from "waku/router";
import { getVectorSql, sql } from "../../shared/db";
import { PostType } from "../../shared/types";
import { Header } from "../../shared/header";
import { MarkdownWithImagePreview } from "../../shared/MarkdownImageWithPreview";
import {
  AdminWrapper,
  EditLink,
  PostDeleter,
  ShareGifToBluesky,
  ShareImageOrGifToMastodon,
  ShareImageToBluesky,
  ShareToBluesky,
  ShareToMastodon,
  ShareToTwitter,
} from "../../shared/AdminComponents";
import { dateToReadableString } from "../../shared/dateFormatter";
import { extractMarkdownMediaMatches, parseMediaUrls } from "../../shared/mediaParsing";
import { PostMediaEditor } from "../../shared/PostMediaEditor";

async function Post({ slug }: PageProps<"/post/[slug]">) {
  const postData: PostType[] = await sql`
    SELECT p.id, p.title, p.content, p.created_at, p.slug,
           COALESCE(json_agg(t.name) FILTER (WHERE t.id IS NOT NULL), '[]') AS tags
    FROM posts p
    LEFT JOIN post_tags pt ON p.id = pt.post_id
    LEFT JOIN tags t ON pt.tag_id = t.id
    WHERE p.slug = ${slug}
    GROUP BY p.id, p.title, p.content, p.created_at, p.slug`;

  const postCountData = await sql`
    SELECT COUNT(*) AS count
    FROM posts`;

  const totalPostCount = postCountData[0]!.count;

  const post = postData[0]!;
  const mediaUrls = parseMediaUrls(post.content);
  const vectorSql = getVectorSql();
  const mediaDescriptions = mediaUrls.length
    ? await vectorSql<{ url: string; description: string }[]>`
        SELECT url, description
        FROM media_descriptions
        WHERE url = ANY(${mediaUrls})
      `
    : [];
  const mediaDescriptionMap = new Map(
    mediaDescriptions.map((row) => [row.url, row.description]),
  );

  const title =
    post.tags[0] +
    " " +
    (post.title
      ? ": " + post.title
      : "on " + dateToReadableString(post.created_at)) +
    " - Feed";
  const description = post.content
    .split("\n")
    .slice(0, 3)
    .map((line) => line.trim())
    .join(" ");
  const firstImage = extractMarkdownMediaMatches(post.content)[0];
  let imageUrlIncludesGIF = firstImage
    ? firstImage.url
    : "https://feed.grantcuster.com/images/og-image.png";

  let imageUrl = imageUrlIncludesGIF;
  if (imageUrlIncludesGIF && imageUrlIncludesGIF.includes(".gif")) {
    imageUrl = imageUrlIncludesGIF.replace(".gif", "-preview.jpg");
  }

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

  return (
    <>
      <>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta
          property="og:url"
          content={`https://feed.grantcuster.com/post/${slug}`}
        />
        <meta property="og:image" content={imageUrl} />
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:image" content={imageUrl} />
      </>
      <div className="container">
        <Header postCount={totalPostCount} />
        <div className="post-card markdown-body post" id={post.slug}>
          <div>
            <span style={{ color: "var(--accent-aqua)" }}>{post.created_at && dateToReadableString(post.created_at)}</span>
            <EditLink post={post} />
            <PostDeleter deletePost={deletePost} post={post} />
            <AdminWrapper>
              <a
                className="pointer-events-auto hover:underline"
                href="#post-media-descriptions"
                style={{ marginLeft: "1ch" }}
              >
                Media
              </a>
            </AdminWrapper>
          </div>
          <div>
            {post.tags.map((tag) => (
              <a href={`/tag/${tag}`} key={tag} className="tag-link">
                {tag}
              </a>
            ))}
          </div>
          {post.title ? <h2>{post.title}</h2> : <br />}
          <MarkdownWithImagePreview post={post} content={post.content} />
          <AdminWrapper>
            <PostMediaEditor
              postId={post.id}
              items={mediaUrls.map((url) => ({
                url,
                description: mediaDescriptionMap.get(url) ?? "",
              }))}
            />
            <div className="post-share">
              <div className="post-share-row">
                <span>Mastodon</span>
                <ShareToMastodon post={post} />
                <ShareImageOrGifToMastodon
                  post={post}
                  imageUrl={imageUrlIncludesGIF!}
                />
              </div>
              <div className="post-share-row">
                <span>Bluesky</span>
                <ShareToBluesky
                  post={post}
                  title={title.trim()}
                  description={description.trim()}
                  imageUrl={imageUrl}
                />
                <ShareImageToBluesky post={post} imageUrl={imageUrl!} />
                <ShareGifToBluesky
                  post={post}
                  imageUrl={imageUrlIncludesGIF!}
                />
              </div>
              <ShareToTwitter post={post} />
            </div>
          </AdminWrapper>
        </div>
      </div>
    </>
  );
}

export default Post;
