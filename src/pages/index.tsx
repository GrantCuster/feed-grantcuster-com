import type { PageProps } from "waku/router";
import { sql } from "../shared/db";
import { postsPerPage } from "../shared/consts";
import { SearchResults } from "../shared/SearchResults";
import TruncatedPostLink from "../shared/TruncatedPostLink";
import { PostPagination } from "../shared/PostPagination";
import { Header } from "../shared/header";
import { searchPostsPage } from "../shared/search";
import type { SearchPostPayload } from "../shared/search";
import type { PostType } from "../shared/types";

export default async function IndexPage({ query = "" }: PageProps<"/">) {
  const searchParams = new URLSearchParams(query);
  const searchTerm = searchParams.get("q")?.trim() ?? "";
  const isSearching = searchTerm.length > 0;

  let posts: PostType[] = [];
  let searchError: string | null = null;
  let totalPostCount = 0;
  let initialSearchPosts: SearchPostPayload[] = [];
  let hasMoreSearchResults = false;

  if (isSearching) {
    try {
      const searchResults = await searchPostsPage(searchTerm, postsPerPage);
      initialSearchPosts = searchResults.posts;
      hasMoreSearchResults = searchResults.hasMore;
    } catch (error) {
      console.error(error);
      searchError = "Search is unavailable right now.";
    }
  } else {
    posts = await sql<PostType[]>`
      SELECT p.id, p.title, p.content, p.created_at, p.slug,
             COALESCE(json_agg(t.name) FILTER (WHERE t.id IS NOT NULL), '[]') AS tags
      FROM posts p
      LEFT JOIN post_tags pt ON p.id = pt.post_id
      LEFT JOIN tags t ON pt.tag_id = t.id
      GROUP BY p.id, p.title, p.content, p.created_at, p.slug
      ORDER BY p.created_at DESC
      LIMIT ${postsPerPage}
    `;

    const postCountData = await sql<{ count: string }[]>`
      SELECT COUNT(*) AS count
      FROM posts
    `;

    totalPostCount = Number(postCountData[0]?.count ?? 0);
  }

  return (
    <>
      <title>Feed - Grant Custer</title>
      <meta name="description" content="Making and inspiration in progress" />
      <div className="container">
        <Header />
        <div className="feed-search">
          <form action="/" method="get" className="feed-search-form">
            <input
              type="search"
              name="q"
              defaultValue={searchTerm}
              placeholder="Semantic search"
              aria-label="Search the feed"
              autoComplete="off"
            />
            <button type="submit">Search</button>
          </form>
          {isSearching ? (
            <p className="feed-search-meta">
              Results for "{searchTerm}" <a className="feed-search-clear" href="/">Clear</a>
            </p>
          ) : null}
          {searchError ? <p className="feed-search-error">{searchError}</p> : null}
        </div>
        {isSearching ? (
          <SearchResults
            initialPosts={initialSearchPosts}
            initialHasMore={hasMoreSearchResults}
            searchTerm={searchTerm}
          />
        ) : (
          <div className="feed">
            {posts.map((post) => (
              <TruncatedPostLink key={post.slug} post={post} />
            ))}
          </div>
        )}
        {!isSearching ? (
          <PostPagination
            baseLink="/page/"
            page={1}
            totalPostCount={totalPostCount}
            postsOnPage={posts.length}
          />
        ) : null}
      </div>
    </>
  );
}

export const getConfig = async () => {
  return {
    render: "dynamic",
  } as const;
};
