"use client";

import Markdown from "react-markdown";
import { dateFormatter } from "./dateFormatter";
import { MarkdownImageWithCaptionRenderer } from "./markdownComponents";
import { PostType } from "./types";
import remarkGfm from "remark-gfm";
import { useState } from "react";

export function PostEditor({
  post,
  updatePost,
}: {
  post: PostType;
  updatePost: (post: PostType) => void;
}) {
  const [createdAt, setCreatedAt] = useState(post.created_at);
  const [tag, setTag] = useState(post.tags[0]);
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);

  return (
    <div className="flex flex-col overflow-hidden h-[100dvh] items-center">
      <div className="flex max-w-[1200px] w-full h-full overflow-hidden">
        <div className="flex flex-col bg-gruv-black gap-[4px] w-1/2 h-full p-[4px]">
          <div className="text-xs px-2 py-1 uppercase font-mono">Editor</div>
          <label className="bg-hard-black">
            <span className="text-2xs pointer-events-none pt-1 block uppercase px-2 font-mono">
              Created At
            </span>
            <input
              className="py-1 px-2 w-full blue font-mono bg-hard-black text-sm focus:outline-none"
              type="text"
              value={createdAt}
              onChange={(e) => setCreatedAt(e.target.value)}
            />
          </label>
          <label className="bg-hard-black">
            <span className="text-2xs pointer-events-none pt-1 block uppercase px-2 font-mono">
              Tag
            </span>
            <input
              className="py-1 px-2 font-mono bg-hard-black text-sm orange focus:outline-none"
              type="text"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
            />
          </label>
          <label className="bg-hard-black">
            <span className="text-2xs pointer-events-none pt-1 block uppercase px-2 font-mono">
              Title
            </span>
            <input
              className="py-1 px-2 font-mono bg-hard-black text-sm green focus:outline-none"
              type="text"
              value={title || ""}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>
          <textarea
            className="py-1 px-2 grow font-mono bg-hard-black text-sm resize-none focus:outline-none"
            rows={10}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <div className="flex justify-end">
            <button 
              className="px-2 py-1 font-mono cursor-pointer text-xs green hover:bg-neutral-700"

              onClick={() => updatePost({ ...post, title: title })}>
              Save
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-[2px] w-1/2 h-full overflow-auto">
          <div className="px-2 py-1 text-sm uppercase">Preview</div>
          <div
            className="bg-hard-black relative text-left post px-[1lh] py-[1lh]"
            key={post.id}
            id={post.slug}
          >
            <div className="relative pointer-events-none">
              {dateFormatter
                .format(
                  new Date(
                    new Date(post.created_at).getTime() - 1000 * 60 * 60 * 4,
                  ),
                )
                .toLocaleString()}
              <div className="orange">
                <span key={tag}>{tag}</span>
              </div>
              <div className="green mb-[1lh]">{title}</div>
              <Markdown
                remarkPlugins={[remarkGfm]}
                components={{
                  img: MarkdownImageWithCaptionRenderer,
                }}
              >
                {content}
              </Markdown>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
