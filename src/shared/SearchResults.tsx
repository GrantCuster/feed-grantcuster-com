"use client";

import { startTransition, useState } from "react";
import { postsPerPage } from "./consts";
import { loadMoreSearchResults } from "./searchActions";
import type { SearchPostPayload } from "./search";
import TruncatedPostLink from "./TruncatedPostLink";
import { PostType } from "./types";

function deserializeSearchPost(post: SearchPostPayload): PostType {
  return {
    ...post,
    created_at: new Date(post.created_at),
  };
}

export function SearchResults({
  initialPosts,
  initialHasMore,
  searchTerm,
}: {
  initialPosts: SearchPostPayload[];
  initialHasMore: boolean;
  searchTerm: string;
}) {
  const [posts, setPosts] = useState(initialPosts);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);

  return (
    <>
      <div className="feed" id="search-results">
        {posts.map((post) => (
          <TruncatedPostLink key={post.slug} post={deserializeSearchPost(post)} />
        ))}
      </div>
      {hasMore ? (
        <div className="feed-search-load-more">
          <button
            type="button"
            disabled={isLoadingMore}
            onClick={() => {
              setIsLoadingMore(true);
              setLoadMoreError(null);
              startTransition(async () => {
                try {
                  const nextPage = await loadMoreSearchResults(searchTerm, posts.length, postsPerPage);
                  setPosts((currentPosts) => [...currentPosts, ...nextPage.posts]);
                  setHasMore(nextPage.hasMore);
                } catch (error) {
                  console.error(error);
                  setLoadMoreError("Could not load more results.");
                } finally {
                  setIsLoadingMore(false);
                }
              });
            }}
          >
            {isLoadingMore ? "Loading..." : "Load more"}
          </button>
          {loadMoreError ? <p className="feed-search-error">{loadMoreError}</p> : null}
        </div>
      ) : null}
    </>
  );
}
