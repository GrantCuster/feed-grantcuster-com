"use server";

import { getVectorSql } from "./db";
import { reembedPostById } from "./embeddingSync";

export async function updatePostMediaDescription(
  url: string,
  description: string,
  adminPassword: string,
) {
  if (adminPassword !== process.env.ADMIN_PASSWORD) {
    throw new Error("Unauthorized");
  }

  const vectorSql = getVectorSql();
  const normalizedDescription = description.trim();

  await vectorSql`
    INSERT INTO media_descriptions (url, description)
    VALUES (${url}, ${normalizedDescription})
    ON CONFLICT (url) DO UPDATE SET
      description = EXCLUDED.description,
      created_at = NOW()
  `;

  return {
    url,
    description: normalizedDescription,
  };
}

export async function reembedPost(postId: number, adminPassword: string) {
  if (adminPassword !== process.env.ADMIN_PASSWORD) {
    throw new Error("Unauthorized");
  }

  return reembedPostById(postId);
}
