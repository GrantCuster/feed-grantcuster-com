import { EditLink } from "./AdminComponents";
import { dateToReadableString } from "./dateFormatter";
import { MarkdownWithImagePreview } from "./MarkdownImageWithPreview";
import { PostType } from "./types";

export default function TruncatedPostLink({ post }: { post: PostType }) {
  const sections = post.content.split("\n");
  return (
    <div className="post-card markdown-body post" id={post.slug} style={{ position: "relative" }}>
      <a
        href={`/post/${post.slug}`}
        aria-label={post.title ?? `Open post from ${dateToReadableString(post.created_at)}`}
        style={{ position: "absolute", inset: 0, zIndex: 1 }}
      />
      <div style={{ position: "relative", zIndex: 2, pointerEvents: "none" }}>
        <div className="post-meta">
          <span className="post-date" style={{ color: "var(--accent-aqua)" }}>{post.created_at && dateToReadableString(post.created_at)}</span>
          <EditLink post={post} />
        </div>
        {post.title ? <h2>{post.title}</h2> : null}
        <MarkdownWithImagePreview
          post={post}
          content={sections.slice(0, 5).join("\n")}
        />
        {sections.length > 5 && (
          <a className="post-read-more" href={`/post/${post.slug}`} style={{ pointerEvents: "auto", position: "relative", zIndex: 3, color: "var(--accent-yellow)", textDecoration: "none" }}>
            Read more
          </a>
        )}
      </div>
    </div>
  );
}
