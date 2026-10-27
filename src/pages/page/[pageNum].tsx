import type { PageProps } from "waku/router";
import InfiniteFeed from "../../shared/InfiniteFeed";
import { getFeedPage } from "../../shared/feedData";
import { postsPerPage } from "../../shared/consts";
import { Header } from "../../shared/header";

export default async function PostPage({ pageNum = "1" }: PageProps<"/page/[pageNum]">) {
  const page = Math.max(1, Number.parseInt(pageNum, 10) || 1);
  const initialPage = await getFeedPage({ offset: (page - 1) * postsPerPage });
  return (
    <>
      <title>Feed - Grant Custer</title>
      <meta name="description" content="Making and inspiration in progress" />
      <div className="container">
        <Header />
        <InfiniteFeed key={page} initialPage={initialPage} />
      </div>
    </>
  );
}

export const getConfig = async () => ({ render: "dynamic" } as const);
