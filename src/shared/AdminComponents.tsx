"use client";

import { useAtom } from "jotai";
import { PostType } from "./types";
import { adminPasswordAtom } from "./atoms";
import { loadImage, makeSocialShare } from "./utils";
import { useEffect, useState } from "react";
import { getGardenExtraBaseUrl } from "./consts";

export function PostDeleter({
  deletePost,
  post,
}: {
  deletePost: (post: PostType, adminPassword: string) => Promise<void>;
  post: PostType;
}) {
  const [adminPassword] = useAtom(adminPasswordAtom);

  return adminPassword ? (
    <button
      className="text-red-400 pointer-events-auto hover:underline"
      onClick={async () => {
        if (confirm("Are you sure you want to delete this post?")) {
          if (adminPassword) {
            await deletePost(post, adminPassword);
            window.location.href = `/`;
          } else {
            alert("No password");
          }
        }
      }}
    >
      x
    </button>
  ) : null;
}

export function EditLink({ post }: { post: PostType }) {
  const [adminPassword] = useAtom(adminPasswordAtom);

  return adminPassword ? (
    <a
      className="pointer-events-auto hover:underline"
      href={`/editor/${post.slug}`}
    >
      edit
    </a>
  ) : null;
}

export function AddPostLink() {
  const [adminPassword] = useAtom(adminPasswordAtom);

  return adminPassword ? (
    <a className="pointer-events-auto hover:underline" href={`/creator`}>
      add
    </a>
  ) : null;
}

export function LogoutLink() {
  const [adminPassword] = useAtom(adminPasswordAtom);
  return adminPassword ? (
    <a className="pointer-events-auto hover:underline" href={`/logout`}>
      logout
    </a>
  ) : null;
}

export function ShareToMastodon({ post }: { post: PostType }) {
  const [adminPassword] = useAtom(adminPasswordAtom);
  const [postStatus, setPostStatus] = useState<
    "unshared" | "sharing" | "shared"
  >("unshared");

  return postStatus === "unshared" ? (
    <button
      className="pointer-events-auto purple hover:underline"
      onClick={async () => {
        if (!adminPassword) {
          alert("No password");
          return;
        }
        setPostStatus("sharing");
        const status =
          makeSocialShare(post) +
          "\n" +
          "https://feed.grantcuster.com/post/" +
          post.slug;
        const fetchUrl = `${getGardenExtraBaseUrl()}api/postToMastodon`;
        await fetch(fetchUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminPassword}`,
          },
          body: JSON.stringify({
            status,
          }),
        });
        setPostStatus("shared");
      }}
    >
      Link
    </button>
  ) : postStatus === "sharing" ? (
    <span>Sharing...</span>
  ) : (
    <span>Shared!</span>
  );
}

export function ShareImageOrGifToMastodon({
  post,
  imageUrl,
}: {
  post: PostType;
  imageUrl: string;
}) {
  const [adminPassword] = useAtom(adminPasswordAtom);
  const [postStatus, setPostStatus] = useState<
    "unshared" | "sharing" | "shared"
  >("unshared");

  return postStatus === "unshared" ? (
    <button
      className="pointer-events-auto purple hover:underline"
      onClick={async () => {
        if (!adminPassword) {
          alert("No password");
          return;
        }
        setPostStatus("sharing");
        const status =
          makeSocialShare(post) +
          "\n" +
          "https://feed.grantcuster.com/post/" +
          post.slug;
        const fetchUrl = `${getGardenExtraBaseUrl()}api/postImageOrGIfToMastodon`;
        await fetch(fetchUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminPassword}`,
          },
          body: JSON.stringify({
            status,
            imageUrl,
          }),
        });
        setPostStatus("shared");
      }}
    >
      Image/GIF
    </button>
  ) : postStatus === "sharing" ? (
    <span>Sharing...</span>
  ) : (
    <span>Shared!</span>
  );
}

export function ShareImageToBluesky({
  post,
  imageUrl,
}: {
  post: PostType;
  imageUrl: string;
}) {
  const [adminPassword] = useAtom(adminPasswordAtom);
  const [postStatus, setPostStatus] = useState<
    "unshared" | "sharing" | "shared"
  >("unshared");
  const [width, setWidth] = useState<number | undefined>(undefined);
  const [height, setHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    async function main() {
      const loadedImage = await loadImage(imageUrl);
      setWidth(loadedImage.width);
      setHeight(loadedImage.height);
    }
    main();
  }, [imageUrl]);

  return postStatus === "unshared" ? (
    <button
      className="pointer-events-auto purple hover:underline"
      onClick={async () => {
        if (!adminPassword) {
          alert("No password");
          return;
        }
        setPostStatus("sharing");
        const status =
          makeSocialShare(post) +
          "\n" +
          "https://feed.grantcuster.com/post/" +
          post.slug;
        const fetchUrl = `${getGardenExtraBaseUrl()}api/postImageToBluesky`;
        await fetch(fetchUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminPassword}`,
          },
          body: JSON.stringify({
            status,
            imageUrl,
            width,
            height,
          }),
        });
        setPostStatus("shared");
      }}
    >
      Image
    </button>
  ) : postStatus === "sharing" ? (
    <span>Sharing...</span>
  ) : (
    <span>Shared!</span>
  );
}

export function ShareGifToBluesky({
  post,
  imageUrl,
}: {
  post: PostType;
  imageUrl: string;
}) {
  const [adminPassword] = useAtom(adminPasswordAtom);
  const [postStatus, setPostStatus] = useState<
    "unshared" | "sharing" | "shared"
  >("unshared");

  return postStatus === "unshared" ? (
    <button
      className="pointer-events-auto purple hover:underline"
      onClick={async () => {
        if (!adminPassword) {
          alert("No password");
          return;
        }
        setPostStatus("sharing");
        const status =
          makeSocialShare(post) +
          "\n" +
          "https://feed.grantcuster.com/post/" +
          post.slug;
        const fetchUrl = `${getGardenExtraBaseUrl()}api/postGifToBluesky`;
        await fetch(fetchUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminPassword}`,
          },
          body: JSON.stringify({
            status,
            imageUrl,
          }),
        });
        setPostStatus("shared");
      }}
    >
      GIF
    </button>
  ) : postStatus === "sharing" ? (
    <span>Sharing...</span>
  ) : (
    <span>Shared!</span>
  );
}

export function ShareToBluesky({
  post,
  imageUrl,
  description,
  title,
}: {
  post: PostType;
  imageUrl: string | undefined;
  description: string;
  title: string;
}) {
  const [adminPassword] = useAtom(adminPasswordAtom);
  const [postStatus, setPostStatus] = useState<
    "unshared" | "sharing" | "shared"
  >("unshared");

  return postStatus === "unshared" ? (
    <button
      className="pointer-events-auto purple hover:underline"
      onClick={async () => {
        if (!adminPassword) {
          alert("No password");
          return;
        }

        setPostStatus("sharing");
        const status = makeSocialShare(post);

        const url = `https://feed.grantcuster.com/post/${post.slug}`;

        const fetchUrl = `${getGardenExtraBaseUrl()}api/postToBluesky`;
        await fetch(fetchUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminPassword}`,
          },
          body: JSON.stringify({
            title,
            description,
            status,
            url,
            image: imageUrl,
          }),
        });
        setPostStatus("shared");
      }}
    >
      Link
    </button>
  ) : postStatus === "sharing" ? (
    <span>Sharing...</span>
  ) : (
    <span>Shared!</span>
  );
}

export function ShareToTwitter({ post }: { post: PostType }) {
  const excerpt = makeSocialShare(post);
  const splits = excerpt.split(" ");
  let truncated = "";
  for (const word of splits) {
    if (truncated.length + word.length + 1 > 280 - 24) {
      break;
    }
    truncated += word + " ";
  }

  return (
    <a
      className="pointer-events-auto purple hover:underline"
      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(truncated)}&url=https://feed.grantcuster.com/post/${post.slug}`}
      target="_blank"
    >
      Tweet
    </a>
  );
}

export function AdminWrapper({ children }: { children: React.ReactNode }) {
  const [adminPassword] = useAtom(adminPasswordAtom);

  return adminPassword ? <>{children}</> : null;
}
