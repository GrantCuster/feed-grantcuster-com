"use client";

import { startTransition, useMemo, useState } from "react";
import { useAtom } from "jotai";
import { adminPasswordAtom } from "./atoms";
import { reembedPost, updatePostMediaDescription } from "./postMediaActions";

type PostMediaDescription = {
  url: string;
  description: string;
};

export function PostMediaEditor({
  postId,
  items,
}: {
  postId: number;
  items: PostMediaDescription[];
}) {
  const [adminPassword] = useAtom(adminPasswordAtom);
  const [drafts, setDrafts] = useState<Record<string, string>>(
    Object.fromEntries(items.map((item) => [item.url, item.description])),
  );
  const [saved, setSaved] = useState<Record<string, string>>(
    Object.fromEntries(items.map((item) => [item.url, item.description])),
  );
  const [saveStates, setSaveStates] = useState<Record<string, "idle" | "saving" | "saved" | "error">>({});
  const [reembedState, setReembedState] = useState<"idle" | "reembedding" | "done" | "error">("idle");

  const hasUnsavedChanges = useMemo(
    () => items.some((item) => (drafts[item.url] ?? "").trim() !== (saved[item.url] ?? "").trim()),
    [drafts, items, saved],
  );

  if (!adminPassword || items.length === 0) {
    return null;
  }

  return (
    <div className="post-media-editor" id="post-media-descriptions">
      <div className="post-media-editor-header">
        <span>Media descriptions</span>
        <button
          className="editor-save-btn"
          disabled={reembedState === "reembedding" || hasUnsavedChanges}
          onClick={() => {
            setReembedState("reembedding");
            startTransition(async () => {
              try {
                await reembedPost(postId, adminPassword);
                setReembedState("done");
              } catch (error) {
                console.error("Failed to re-embed post", error);
                setReembedState("error");
              }
            });
          }}
        >
          {reembedState === "reembedding" ? "Re-embedding..." : "Re-embed post"}
        </button>
      </div>
      <div className="post-media-editor-meta">
        Edit the saved descriptions used for embeddings, then re-embed the post.
      </div>
      <div className="post-media-editor-status">
        {hasUnsavedChanges ? "Save description edits before re-embedding." : null}
        {!hasUnsavedChanges && reembedState === "done" ? "Post re-embedded." : null}
        {reembedState === "error" ? "Re-embed failed." : null}
      </div>
      <div className="post-media-editor-list">
        {items.map((item, index) => {
          const value = drafts[item.url] ?? "";
          const saveState = saveStates[item.url] ?? "idle";
          const changed = value.trim() !== (saved[item.url] ?? "").trim();
          return (
            <div key={item.url} className="post-media-editor-item">
              <div className="post-media-editor-item-header">
                <span>Media {index + 1}</span>
                <a href={item.url} target="_blank" rel="noreferrer">
                  open
                </a>
              </div>
              <div className="post-media-editor-url">{item.url}</div>
              <textarea
                className="editor-textarea post-media-editor-textarea"
                value={value}
                onChange={(e) => {
                  const nextValue = e.target.value;
                  setDrafts((current) => ({ ...current, [item.url]: nextValue }));
                  setSaveStates((current) => ({ ...current, [item.url]: "idle" }));
                  setReembedState("idle");
                }}
              />
              <div className="post-media-editor-actions">
                <div className="post-media-editor-save-state">
                  {saveState === "saving" && "Saving..."}
                  {saveState === "saved" && !changed && "Saved"}
                  {saveState === "error" && "Save failed"}
                </div>
                <button
                  className="editor-save-btn"
                  disabled={!changed || saveState === "saving"}
                  onClick={() => {
                    setSaveStates((current) => ({ ...current, [item.url]: "saving" }));
                    startTransition(async () => {
                      try {
                        const result = await updatePostMediaDescription(
                          item.url,
                          value,
                          adminPassword,
                        );
                        setDrafts((current) => ({ ...current, [item.url]: result.description }));
                        setSaved((current) => ({ ...current, [item.url]: result.description }));
                        setSaveStates((current) => ({ ...current, [item.url]: "saved" }));
                      } catch (error) {
                        console.error("Failed to save media description", error);
                        setSaveStates((current) => ({ ...current, [item.url]: "error" }));
                      }
                    });
                  }}
                >
                  Save description
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
