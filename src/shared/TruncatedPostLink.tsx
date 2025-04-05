import { dateFormatter } from "./dateFormatter";
import { MarkdownWithImagePreview } from "./MarkdownImageWithPreview";
import { PostType } from "./types";

export default function TruncatedPostLink({ post }: { post: PostType }) {
  const sections = post.content.split("\n");
  return (
    <div
      className="bg-hard-black relative text-left post px-[1lh] py-[1lh]"
      key={post.id}
      id={post.slug}
    >
      <a href={`/post/${post.slug}`} className="absolute inset-0">
        <div className="absolute inset-0"></div>
      </a>
      <div className="relative pointer-events-none">
        <div className="flex justify-between">
          <div className="blue">
            {dateFormatter
              .format(
                new Date(
                  new Date(post.created_at).getTime() - 1000 * 60 * 60 * 4,
                ),
              )
              .toLocaleString()}
          </div>
          <div>
            <a className="gray hover:underline pointer-events-auto" href={`/editor/${post.slug}`}>
              edit
            </a>
          </div>
        </div>
        <div className="orange">
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
          content={sections.slice(0, 4).join("\n")}
        />
        {sections.length > 4 && <div className="gray">Read more</div>}
      </div>
    </div>
  );
}
