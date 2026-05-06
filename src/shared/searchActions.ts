"use server";

import { searchPostsPage } from "./search";

export async function loadMoreSearchResults(query: string, offset: number, limit: number) {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) {
    return { posts: [], hasMore: false };
  }

  return searchPostsPage(normalizedQuery, limit, offset);
}
