"use server";

import { syncEmbeddings } from "./embeddingSync";

let activeSync: Promise<Awaited<ReturnType<typeof syncEmbeddings>>> | null = null;

export async function runEmbeddingSync(adminPassword: string) {
  if (adminPassword !== process.env.ADMIN_PASSWORD) {
    throw new Error("Unauthorized");
  }

  if (activeSync) {
    return {
      status: "running" as const,
      result: null,
    };
  }

  activeSync = syncEmbeddings();

  try {
    const result = await activeSync;
    return {
      status: "completed" as const,
      result,
    };
  } finally {
    activeSync = null;
  }
}
