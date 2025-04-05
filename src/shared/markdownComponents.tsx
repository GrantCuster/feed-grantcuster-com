import { useRef, useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const MarkdownImageWithCaptionRenderer = ({
  alt,
  src,
}: {
  alt: string;
  src: string;
}) => (
  <>
    <img src={src} alt={alt} />
    {alt && <em>{alt}</em>}
  </>
);


