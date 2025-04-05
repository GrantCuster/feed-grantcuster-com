"use client";

import { useEffect, useRef, useState } from "react";
import remarkGfm from "remark-gfm";
import { MarkdownImageWithCaptionRenderer } from "./markdownComponents";
import Markdown from "react-markdown";
import { PostType } from "./types";

export const MarkdownWithImagePreview = ({
  post,
  content,
}: {
  post: PostType;
  content: string;
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    const $post = document.getElementById(post.slug);
    if (!$post) return;
    const imgs = $post.querySelectorAll("img");
    imgs.forEach((img) => {
      img.addEventListener("click", () => {
        const imgSrc = img.getAttribute("src");
        if (!imgSrc) return;
        setImagePreview(imgSrc);
        document.body.style.overflow = "hidden";
      });
    });
    return () => {
      imgs.forEach((img) => {
        img.removeEventListener("click", () => {});
      });
    };
  }, []);

  return (
    <div className="post-body">
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          img: MarkdownImageWithCaptionRenderer,
        }}
      >
        {content}
      </Markdown>
      {imagePreview && (
        <div
          className="fixed top-0 left-0 w-full h-full bg-black flex justify-center items-center z-50"
          onClick={() => {
            setImagePreview(null);
            document.body.style.overflow = "auto";
          }}
        >
          <img
            src={imagePreview}
            alt="preview"
            className="preview left-0 top-0 w-full h-full object-contain"
          />
        </div>
      )}
    </div>
  );
};
