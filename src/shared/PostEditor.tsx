"use client";

import {
  dateToReadableString,
  slugTimestampToDate,
  dateToSlugTimestamp,
} from "./dateFormatter";
import { PostType } from "./types";
import { useEffect, useRef, useState } from "react";
import { makeSlug } from "./utils";
import { MarkdownWithImagePreview } from "./MarkdownImageWithPreview";
import { adminPasswordAtom } from "./atoms";
import { useAtom } from "jotai";
import { getGardenExtraBaseUrl } from "./consts";
import { Link } from "waku";

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

  const contentRef = useRef(content);
  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  return (
    <div className="editor-layout">
      <div className="editor-topbar">
        <Link to="/">Feed</Link>
      </div>

      <div className="editor-panes">
        <div className="editor-panel">
          <div className="editor-panel-header">
            <span>Editor</span>
            <div className="editor-actions">
              <label className="editor-upload-btn">
                <input
                  type="file"
                  style={{ display: "none" }}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const formData = new FormData();
                      formData.append("file", file);
                      try {
                        const res = await fetch(
                          `${getGardenExtraBaseUrl()}api/upload`,
                          {
                            headers: { Authorization: `Bearer ${adminPassword}` },
                            method: "POST",
                            body: formData,
                          },
                        );
                        const result = await res.json();
                        const current = contentRef.current;
                        if (result.message === "Images uploaded successfully") {
                          setContent(current + `\n\n![](${result.largeImageUrl})`);
                        } else if (result.message === "GIF and preview uploaded successfully") {
                          setContent(current + `\n\n![](${result.gifUrl})`);
                        } else if (result.message === "Video uploaded successfully") {
                          setContent(current + `\n\n<p><video controls muted autoplay loop src="${result.videoUrl}"></video><em></em></p>`);
                        }
                      } catch (err) {
                        console.error("Upload failed", err);
                      }
                    }
                  }}
                />
                Upload
              </label>
              <button
                className="editor-save-btn"
                onClick={async () => {
                  let _slug = slug;
                  if (slug.length === 0) {
                    _slug = createdAtEdit;
                    if (title && title.length > 0) {
                      _slug += "-" + makeSlug(title);
                    }
                  }
                  const newPost = {
                    ...post,
                    title,
                    content,
                    slug: _slug,
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

          <div className="editor-field">
            <label className="editor-label">Slug</label>
            <div className="editor-input-row">
              <input
                className="editor-input"
                type="text"
                value={slug || ""}
                onChange={(e) => setSlug(e.target.value)}
              />
              <button
                className="editor-inline-btn"
                onClick={() => {
                  let s = createdAtEdit;
                  if (title && title.length > 0) s += "-" + makeSlug(title);
                  setSlug(s);
                }}
              >
                gen
              </button>
            </div>
            {originalPost.slug !== slug && <div className="editor-changed" />}
          </div>

          <div className="editor-field">
            <label className="editor-label">Created At</label>
            <div className="editor-input-row">
              <input
                className="editor-input"
                type="text"
                value={createdAtEdit}
                onChange={(e) => setCreatedAtEdit(e.target.value)}
              />
              <button
                className="editor-inline-btn"
                onClick={() => setCreatedAtEdit(dateToSlugTimestamp(new Date()))}
              >
                now
              </button>
            </div>
            {originalCreatedAt !== createdAtEdit && <div className="editor-changed" />}
          </div>

          <div className="editor-field">
            <label className="editor-label">Tag</label>
            <input
              className="editor-input"
              type="text"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
            />
            {originalPost.tags[0] !== tag && <div className="editor-changed" />}
          </div>

          <div className="editor-field">
            <label className="editor-label">Title</label>
            <input
              className="editor-input"
              type="text"
              value={title || ""}
              onChange={(e) => setTitle(e.target.value)}
            />
            {originalPost.title !== title && <div className="editor-changed" />}
          </div>

          <div className="editor-field editor-field--grow">
            <label className="editor-label">Content</label>
            <textarea
              className="editor-textarea"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            {originalPost.content !== content && <div className="editor-changed" />}
          </div>
        </div>

        <div className="editor-preview-panel">
          <div className="editor-panel-header">
            <span>Preview</span>
          </div>
          <div className="post-card markdown-body post" id={post.slug}>
            <div>
              {slugTimestampToDate(createdAtEdit) ? dateToReadableString(slugTimestampToDate(createdAtEdit)!) : "Invalid Date"}
            </div>
            <div>
              <a href={`/tag/${tag}`}>{tag}</a>
            </div>
            {title ? <h2>{title}</h2> : <br />}
            <MarkdownWithImagePreview post={post} content={content} />
          </div>
        </div>
      </div>
    </div>
  );
}
