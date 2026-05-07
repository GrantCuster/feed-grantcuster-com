"use client";

import { startTransition, useMemo, useState } from "react";
import { useAtom } from "jotai";
import { adminPasswordAtom } from "./atoms";
import { updateMediaDescription } from "./mediaDescriptionActions";
import { MediaDescriptionType } from "./types";

const imageTypes = ["jpg", "jpeg", "png", "gif", "webp"];
const videoTypes = ["mp4", "mov", "webm"];
const audioTypes = ["mp3", "wav"];

function getMediaExt(url: string) {
  return url.split("?")[0].split(".").pop()?.toLowerCase() ?? "";
}

export function MediaDescriptionList({
  items,
}: {
  items: MediaDescriptionType[];
}) {
  const [adminPassword] = useAtom(adminPasswordAtom);
  const [pageIndex, setPageIndex] = useState(0);
  const [drafts, setDrafts] = useState<Record<string, string>>(
    Object.fromEntries(items.map((item) => [item.url, item.description])),
  );
  const [saved, setSaved] = useState<Record<string, string>>(
    Object.fromEntries(items.map((item) => [item.url, item.description])),
  );
  const [saveStates, setSaveStates] = useState<
    Record<string, "idle" | "saving" | "saved" | "error">
  >({});
  const perPage = 20;

  const pageCount = Math.max(1, Math.ceil(items.length / perPage));
  const pageItems = useMemo(
    () => items.slice(pageIndex * perPage, (pageIndex + 1) * perPage),
    [items, pageIndex],
  );

  if (!adminPassword) {
    return (
      <div className="flex flex-col gap-4">
        <div className="text-center">Please log in to view media descriptions</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="media-description-list">
        <div className="media-description-list-header">
          <div>
            Media descriptions - page {pageIndex + 1} of {pageCount}
          </div>
          <div className="media-description-list-controls">
            <button
              className="editor-inline-btn"
              disabled={pageIndex === 0}
              onClick={() => {
                setPageIndex((prev) => Math.max(prev - 1, 0));
                window.scrollTo({ top: 0 });
              }}
            >
              prev
            </button>
            <button
              className="editor-inline-btn"
              disabled={pageIndex >= pageCount - 1}
              onClick={() => {
                setPageIndex((prev) => Math.min(prev + 1, pageCount - 1));
                window.scrollTo({ top: 0 });
              }}
            >
              next
            </button>
          </div>
        </div>
        <div className="media-description-list-meta">
          {items.length} media items with saved descriptions
        </div>
        <div className="media-description-list-items">
          {pageItems.map((item) => {
            const ext = getMediaExt(item.url);
            const isImage = imageTypes.includes(ext);
            const isVideo = videoTypes.includes(ext);
            const isAudio = audioTypes.includes(ext);
            const draft = drafts[item.url] ?? "";
            const savedValue = saved[item.url] ?? "";
            const saveState = saveStates[item.url] ?? "idle";
            const hasChanges = draft.trim() !== savedValue.trim();

            return (
              <div key={item.url} className="post-media-editor-item">
                <div className="post-media-editor-item-header">
                  <span>{new Date(item.created_at).toLocaleString()}</span>
                  <a href={item.url} target="_blank" rel="noreferrer">
                    open
                  </a>
                </div>
                {isImage ? <img src={item.url} alt={item.url} /> : null}
                {isVideo ? (
                  <video controls src={item.url} className="w-full h-auto" />
                ) : null}
                {isAudio ? <audio controls src={item.url} /> : null}
                <div className="post-media-editor-url">{item.url}</div>
                <textarea
                  className="editor-textarea post-media-editor-textarea"
                  value={draft}
                  onChange={(e) => {
                    const nextValue = e.target.value;
                    setDrafts((current) => ({ ...current, [item.url]: nextValue }));
                    setSaveStates((current) => ({ ...current, [item.url]: "idle" }));
                  }}
                />
                <div className="post-media-editor-actions">
                  <div className="post-media-editor-save-state">
                    {saveState === "saving" && "Saving..."}
                    {saveState === "saved" && !hasChanges && "Saved"}
                    {saveState === "error" && "Save failed"}
                  </div>
                  <button
                    className="editor-save-btn"
                    disabled={!hasChanges || saveState === "saving"}
                    onClick={() => {
                      setSaveStates((current) => ({ ...current, [item.url]: "saving" }));
                      startTransition(async () => {
                        try {
                          const result = await updateMediaDescription(
                            item.url,
                            draft,
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
    </div>
  );
}
