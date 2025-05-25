"use client";

import { useEffect, useState } from "react";
import { getGardenExtraBaseUrl } from "./consts";
import { adminPasswordAtom } from "./atoms";
import { useAtom } from "jotai";
import { UploadType } from "./types";

const link = "https://grant-uploader.s3.us-east-2.amazonaws.com/";

export function MediaList({ uploads }: { uploads: UploadType[] }) {
  const [adminPassword] = useAtom(adminPasswordAtom);
  const [index, setIndex] = useState(0);
  const perPage = 12;

  if (!adminPassword) {
    return (
      <div className="flex flex-col gap-4">
        <div className="text-center">Please log in to view media</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-col mx-auto max-w-[512px] gap-8 mt-8">
        <div className="flex justify-between">
          <div className="">Media - page {index + 1}</div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setIndex((prev) => Math.max(prev - 1, 0));
                window.scrollTo({
                  top: 0,
                });
              }}
              disabled={index === 0}
              className="disabled:opacity-50"
            >
              prev
            </button>
            <button
              onClick={() => {
                setIndex((prev) =>
                  Math.min(prev + 1, Math.ceil(uploads.length / perPage) - 1),
                );
                window.scrollTo({
                  top: 0,
                });
              }}
              disabled={index === Math.ceil(uploads.length / perPage) - 1}
              className="disabled:opacity-50"
            >
              next
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-12 mb-12">
          {uploads.slice(index * perPage, (index + 1) * perPage).map((item) => (
            <Media key={item.s3_key} item={item} />
          ))}
        </div>
        <button
          onClick={() => {
            setIndex((prev) => prev + 1);
            window.scrollTo({
              top: 0,
            });
          }}
          className="bg-neutral-800 pointer py-2 px-4 rounded mb-16"
        >
          Load more
        </button>
      </div>
    </div>
  );
}

export function Media({ item }: { item: UploadType }) {
  const [isCopying, setIsCopying] = useState(false);

  // files imported by old script has bare file types instead of mimetypes, should fix sometime
  const imageTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "jpg",
    "jpeg",
    "png",
    "gif",
  ];
  const videoTypes = ["video/mp4", "mp4"];
  const audioTypes = ["audio/mp3", "audio/wav", "mp3", "wav"];
  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-1">
        <div>{new Date(item.created_at).toLocaleString()}</div>
        {imageTypes.includes(item.file_type) && (
          <img src={`${link}${item.s3_key}`} alt={item.s3_key} />
        )}
        {videoTypes.includes(item.file_type) && (
          <video
            controls
            src={`${link}${item.s3_key}`}
            className="w-full h-auto"
          />
        )}
        {audioTypes.includes(item.file_type) && (
          <audio controls src={`${link}${item.s3_key}`} />
        )}
        <div className="flex justify-between">
          <a
            href={`${link}${item.s3_key}`}
            target="_blank"
            rel="noopener noreferrer"
            className=""
          >
            {item.s3_key}
          </a>
          <div className="flex gap-2">
            <div className="hidden">{item.file_type}</div>
            {isCopying ? (
              <div className="">copied!</div>
            ) : (
              <button
                onClick={() => {
                  // copy full address to clipboard
                  navigator.clipboard.writeText(`${link}${item.s3_key}`);
                  setIsCopying(true);
                  setTimeout(() => {
                    setIsCopying(false);
                  }, 2000);
                }}
                className="underline pointer"
              >
                copy
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
