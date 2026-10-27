"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FeedPage } from "./feedData";
import { loadMoreFeed } from "./feedActions";
import PostFeed from "./PostFeed";

export default function InfiniteFeed({ initialPage, tag }: { initialPage: FeedPage; tag?: string }) {
  const [posts, setPosts] = useState(initialPage.posts);
  const [cursor, setCursor] = useState(initialPage.nextCursor);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const pending = useRef(false);
  const sentinel = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (!cursor || pending.current) return;
    pending.current = true;
    setLoading(true);
    setError(false);
    try {
      const page = await loadMoreFeed(cursor, tag);
      setPosts(current => {
        const ids = new Set(current.map(post => post.id));
        return [...current, ...page.posts.filter(post => !ids.has(post.id))];
      });
      setCursor(page.nextCursor);
    } catch (error) {
      console.error(error);
      setError(true);
    } finally {
      pending.current = false;
      setLoading(false);
    }
  }, [cursor, tag]);

  useEffect(() => {
    if (!cursor || loading || error || !sentinel.current || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) void loadMore();
    }, { rootMargin: "600px" });
    observer.observe(sentinel.current);
    return () => observer.disconnect();
  }, [cursor, loading, error, loadMore]);

  return (
    <>
      <PostFeed posts={posts.map(post => ({ ...post, created_at: new Date(post.created_at) }))} />
      <div className="feed-loader" ref={sentinel}>
        {error && <p role="alert">Could not load more posts.</p>}
        {cursor ? (
          <button type="button" onClick={() => void loadMore()} disabled={loading}>
            {loading ? "Loading…" : error ? "Try again" : "Load more"}
          </button>
        ) : (
          <p role="status">{posts.length ? "You’ve reached the end." : "No posts yet."}</p>
        )}
      </div>
    </>
  );
}
