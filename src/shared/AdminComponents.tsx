"use client";

import { useAtom } from "jotai";
import { PostType } from "./types";
import { adminPasswordAtom } from "./atoms";

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
    <a className="pointer-events-auto hover:underline" href={`/editor/${post.slug}`}>
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
