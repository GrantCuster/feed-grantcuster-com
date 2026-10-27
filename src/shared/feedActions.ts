"use server";

import { getFeedPage } from "./feedData";
import type { FeedCursor } from "./feedData";

export async function loadMoreFeed(cursor: FeedCursor, tag?: string) {
  if (!cursor || !Number.isSafeInteger(cursor.id) || !Number.isFinite(Date.parse(cursor.createdAt))) {
    throw new Error("Invalid feed cursor");
  }
  return getFeedPage({ cursor, tag });
}
