"use client";

import {
  dateToReadableString,
  slugTimestampToDate,
  dateToSlugTimestamp,
} from "./dateFormatter";
import { PostType } from "./types";
import { useState } from "react";
import { makeSlug } from "./utils";
import { MarkdownWithImagePreview } from "./MarkdownImageWithPreview";
import { adminPasswordAtom } from "./atoms";
import { useAtom } from "jotai";

export function PostEditor({
  post,
  updatePost,
}: {
  post: PostType;
  updatePost: (post: PostType, adminPassword: string) => Promise<void>;
}) {
  const [adminPassword] = useAtom(adminPasswordAtom);
  const [originalPost] = useState(post);
  const originalCreatedAt = dateToSlugTimestamp(post.created_at);
  const [createdAtEdit, setCreatedAtEdit] = useState(
    dateToSlugTimestamp(post.created_at),
  );
  const [tag, setTag] = useState(post.tags[0]);
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  const [slug, setSlug] = useState(post.slug);

  return (
    <div className="flex flex-col overflow-hidden h-[100dvh] items-center">
      <div className="flex max-w  -[1200px] w-full h-full overflow-hidden">
        <div className="flex flex-col bg-gruv-black gap-[4px] w-1/2 h-full p-[4px]">
          <div className="text-xs px-2 py-1 uppercase font-mono">Editor</div>
          <div className="relative bg-hard-black">
            <label className="w-full">
              <span className="text-2xs pointer-events-none pt-1 block uppercase px-2 font-mono">
                Slug
              </span>
              <input
                className="py-1 px-2 font-mono w-full bg-hard-black text-sm green focus:outline-none"
                type="text"
                value={slug || ""}
                onChange={(e) => setSlug(e.target.value)}
              />
              <button
                className="absolute hover:bg-neutral-700 cursor-pointer pointer-events-auto top-0 px-2 py-1 right-4 font-mono text-xs block"
                onClick={() => {
                  let slug = createdAtEdit;
                  if (title && title.length > 0) {
                    slug += "-" + makeSlug(title);
                  }
                  setSlug(slug);
                }}
              >
                gen
              </button>
            </label>
            {originalPost.slug === slug ? null : (
              <div className="absolute -left-[2px] top-0 w-[1px] h-full bg-green"></div>
            )}
          </div>
          <div className="relative">
            <label className="bg-hard-black block relative">
              <span className="text-2xs pointer-events-none pt-1 block uppercase px-2 font-mono">
                Created At
              </span>
              <input
                className="py-1 px-2 w-full blue font-mono bg-hard-black text-sm focus:outline-none"
                type="text"
                value={createdAtEdit}
                onChange={(e) => setCreatedAtEdit(e.target.value)}
              />
            </label>
            <button
              className="absolute hover:bg-neutral-700 cursor-pointer pointer-events-auto top-0 px-2 py-1 right-4 font-mono text-xs block"
              onClick={() => {
                setCreatedAtEdit(dateToSlugTimestamp(new Date()));
              }}
            >
              now
            </button>
            {originalCreatedAt === createdAtEdit ? null : (
              <div className="absolute -left-[2px] top-0 w-[1px] h-full bg-green"></div>
            )}
          </div>
          <div className="relative">
            <label className="bg-hard-black">
              <span className="text-2xs bg-hard-black pointer-events-none pt-1 block uppercase px-2 font-mono">
                Tag
              </span>
              <input
                className="py-1 px-2 font-mono w-full bg-hard-black text-sm orange focus:outline-none"
                type="text"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
              />
              {originalPost.tags[0] === tag ? null : (
                <div className="absolute -left-[2px] top-0 w-[1px] h-full bg-green"></div>
              )}
            </label>
          </div>
          <div className="relative">
            <label className="bg-hard-black">
              <span className="text-2xs bg-hard-black pointer-events-none pt-1 block uppercase px-2 font-mono">
                Title
              </span>
              <input
                className="py-1 px-2 font-mono block bg-hard-black w-full text-sm green focus:outline-none"
                type="text"
                value={title || ""}
                onChange={(e) => setTitle(e.target.value)}
              />
              {originalPost.title === title ? null : (
                <div className="absolute -left-[2px] top-0 w-[1px] h-full bg-green"></div>
              )}
            </label>
          </div>
          <div className="relative grow">
            <textarea
              className="py-1 px-2 absolute inset-0 font-mono bg-hard-black text-sm resize-none focus:outline-none"
              rows={10}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            {originalPost.content === content ? null : (
              <div className="absolute -left-[2px] top-0 w-[1px] h-full bg-green"></div>
            )}
          </div>
          <div className="flex justify-end">
            <button
              className="px-2 py-1 font-mono uppercase cursor-pointer text-xs green hover:bg-neutral-700"
              onClick={async () => {
                let slug = post.slug;
                if (slug.length === 0) {
                  slug = createdAtEdit;
                  if (title && title.length > 0) {
                    slug += "-" + makeSlug(title);
                  }
                }

                const newPost = {
                  ...post,
                  title: title,
                  content: content,
                  slug: slug.length > 0 ? slug : post.slug,
                  // created at needs to be iso string
                  created_at: slugTimestampToDate(createdAtEdit),
                  tags: [tag],
                } as PostType;

                if (adminPassword) {
                  await updatePost(newPost, adminPassword);
                  window.location.href = `/post/${slug}`;
                } else {
                  alert("no password");
                }
              }}
            >
              Save
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-[2px] w-1/2 h-full overflow-auto">
          <div className="px-2 pt-[8px] pb-[3px] text-sm uppercase">
            Preview
          </div>
          <div
            className="bg-hard-black relative text-left post px-[1lh] py-[1lh]"
            key={post.id}
            id={post.slug}
          >
            <div className="relative pointer-events-none">
              <div className="blue">
                {slugTimestampToDate(createdAtEdit)
                  ? dateToReadableString(slugTimestampToDate(createdAtEdit)!)
                  : "Invalid Date"}
              </div>
              <div className="orange">
                <span key={tag}>{tag}</span>
              </div>
              <div className="green mb-[1lh]">{title}</div>
              <MarkdownWithImagePreview post={post} content={content} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
