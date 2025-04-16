"use client";

import { useAtom } from "jotai";
import { PostType } from "./types";
import { adminPasswordAtom } from "./atoms";
import { makeSocialShare } from "./utils";
import { useState } from "react";

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
      className="text-red-500 pointer-events-auto hover:underline"
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
      delete
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
      logout'
    </a>
  ) : null;
}

export function ShareToMastodon({
  post,
  shareToMastodon,
}: {
  post: PostType;
  shareToMastodon: (status: string, adminPassword: string) => Promise<boolean>;
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
          "htps://garden.grantcuster.com/post/" +
          post.slug;
        await shareToMastodon(status, adminPassword);
        setPostStatus("shared");
      }}
    >
      Share to Mastodon
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

        const url = `https://garden.grantcuster.com/post/${post.slug}`;

        await fetch("https://garden-extra.grantcuster.com/api/postToBluesky", {
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
      Share to Bluesky
    </button>
  ) : postStatus === "sharing" ? (
    <span>Sharing...</span>
  ) : (
    <span>Shared!</span>
  );
}

export function ShareToTwitter({ post }: { post: PostType }) {
  const excerpt = makeSocialShare(post)
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
      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(truncated)}&url=https://garden.grantcuster.com/post/${post.slug}`}
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
