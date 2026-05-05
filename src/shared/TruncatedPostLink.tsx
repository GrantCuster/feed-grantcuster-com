import { EditLink } from "./AdminComponents";
import { dateToReadableString } from "./dateFormatter";
import { MarkdownWithImagePreview } from "./MarkdownImageWithPreview";
import { PostType } from "./types";

export default function TruncatedPostLink({ post }: { post: PostType }) {
  const sections = post.content.split("\n");
  return (
    <div className="post-card markdown-body post" id={post.slug} style={{ position: "relative" }}>
      <a href={`/post/${post.slug}`} style={{ position: "absolute", inset: 0 }} />
      <div style={{ position: "relative", pointerEvents: "none" }}>
        <div>
          <span>{post.created_at && dateToReadableString(post.created_at)}</span>
          <EditLink post={post} />
        </div>
        <div>
          {post.tags.map((tag) => (
            <a href={`/tag/${tag}`} key={tag} style={{ pointerEvents: "auto" }}>
              {tag}
            </a>
          ))}
        </div>
        {post.title ? <h2>{post.title}</h2> : <br />}
        <MarkdownWithImagePreview
          post={post}
          content={sections.slice(0, 5).join("\n")}
        />
        {sections.length > 5 && <em>Read more</em>}
      </div>
    </div>
  );
}
