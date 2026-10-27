import type { PageProps } from "waku/router";
import { postsPerPage } from "../shared/consts";
import { SearchResults } from "../shared/SearchResults";
import InfiniteFeed from "../shared/InfiniteFeed";
import { getFeedPage, type FeedPage } from "../shared/feedData";
import { Header } from "../shared/header";
import { searchPostsPage } from "../shared/search";
import type { SearchPostPayload } from "../shared/search";

export default async function IndexPage({ query = "" }: PageProps<"/">) {
  const searchParams = new URLSearchParams(query);
  const searchTerm = searchParams.get("q")?.trim() ?? "";
  const isSearching = searchTerm.length > 0;

  let initialPage: FeedPage = { posts: [], nextCursor: null };
  let searchError: string | null = null;
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
    initialPage = await getFeedPage();
  }

  return (
    <>
      <title>Feed - Grant Custer</title>
      <meta name="description" content="Making and inspiration in progress" />
      <div className="container">
        <Header />
        {isSearching ? (
          <div className="feed-search">
            <p className="feed-search-meta">
              Results for "{searchTerm}" <a className="feed-search-clear" href="/">Clear</a>
            </p>
            {searchError ? <p className="feed-search-error">{searchError}</p> : null}
          </div>
        ) : null}
        {isSearching ? (
          <SearchResults
            initialPosts={initialSearchPosts}
            initialHasMore={hasMoreSearchResults}
            searchTerm={searchTerm}
          />
        ) : (
          <InfiniteFeed initialPage={initialPage} />
        )}
      </div>
    </>
  );
}

export const getConfig = async () => {
  return {
    render: "dynamic",
  } as const;
};
