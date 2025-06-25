import { EditLink } from "./AdminComponents";
import { dateToReadableString } from "./dateFormatter";
import { MarkdownWithImagePreview } from "./MarkdownImageWithPreview";
import { PostType } from "./types";

export default function TruncatedPostLink({ post }: { post: PostType }) {
  const sections = post.content.split("\n");
  return (
    <div
      className="bg-hard-black relative text-left post px-[1lh] pt-[0.75lh] pb-[1lh]"
      key={post.id}
      id={post.slug}
    >
      <a href={`/post/${post.slug}`} className="absolute inset-0">
        <div className="absolute inset-0"></div>
      </a>
      <div className="relative pointer-events-none">
        <div className="flex justify-between">
          <div className="blue departure-mono">
            {post.created_at && dateToReadableString(post.created_at)}
          </div>
          <div>
            <EditLink post={post} />
          </div>
        </div>
        <div className="orange departure-mono">
          {post.tags.map((tag) => (
            <a
              href={`/tag/${tag}`}
              className="pointer-events-auto no-underline hover:underline"
              style={{
                color: "inherit",
              }}
              key={tag}
            >
              {tag}
            </a>
          ))}
        </div>
        <div className="green mb-[1lh]">{post.title}</div>
        <MarkdownWithImagePreview
          post={post}
          content={sections.slice(0, 5).join("\n")}
        />
        {sections.length > 5 && <div className="gray departure-mono mt-[1lh]">Read more</div>}
      </div>
    </div>
  );
}
