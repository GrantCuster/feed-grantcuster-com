import { EditLink } from "./AdminComponents";
import { dateToPostTimestamp } from "./dateFormatter";
import { MarkdownWithImagePreview } from "./MarkdownImageWithPreview";
import type { PostType } from "./types";

export default function FeedPost({ post }: { post: PostType }) {
  return (
    <article className="post-card markdown-body post" id={post.slug}>
      <div className="post-meta feed-post-meta">
        <a className="post-timestamp" href={`/post/${post.slug}`} target="_blank" rel="noopener noreferrer">
          <time dateTime={post.created_at.toISOString()}>
            {dateToPostTimestamp(post.created_at)}
          </time>
        </a>
        <EditLink post={post} />
      </div>
      {post.title ? <h2>{post.title}</h2> : null}
      <MarkdownWithImagePreview post={post} content={post.content} />
    </article>
  );
}
