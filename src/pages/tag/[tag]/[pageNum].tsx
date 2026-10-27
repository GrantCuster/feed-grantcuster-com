import type { PageProps } from "waku/router";
import InfiniteFeed from "../../../shared/InfiniteFeed";
import { getFeedPage } from "../../../shared/feedData";
import { postsPerPage } from "../../../shared/consts";
import { Header } from "../../../shared/header";
import { sql } from "../../../shared/db";

export default async function TagPage({ tag, pageNum = "1" }: PageProps<"/tag/[tag]/[pageNum]">) {
  const page = Math.max(1, Number.parseInt(pageNum, 10) || 1);
  const [initialPage, counts] = await Promise.all([
    getFeedPage({ tag, offset: (page - 1) * postsPerPage }),
    sql<{ count: string }[]>`
      SELECT COUNT(*) AS count FROM posts p
      WHERE EXISTS (
        SELECT 1 FROM post_tags pt JOIN tags t ON t.id = pt.tag_id
        WHERE pt.post_id = p.id AND t.name = ${tag}
      )
    `,
  ]);
  const postCount = Number(counts[0]?.count ?? 0);
  return (
    <div className="container">
      <Header postCount={postCount} />
      <div className="tag-header">
        <span style={{ color: "var(--accent-orange)" }}>{tag}</span>
        <span>{postCount} posts</span>
      </div>
      <InfiniteFeed key={`${tag}-${page}`} initialPage={initialPage} tag={tag} />
    </div>
  );
}

export const getConfig = async () => ({ render: "dynamic" } as const);
