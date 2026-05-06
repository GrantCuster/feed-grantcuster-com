import { Link } from "waku";
import { AddPostLink, EmbeddingSyncButton, LogoutLink } from "./AdminComponents";

export const Header = ({ postCount }: { postCount?: number }) => {
  return (
    <div className="feed-header">
      <Link to="/">Feed</Link>
      <nav>
        <AddPostLink />
        <EmbeddingSyncButton />
        <LogoutLink />
        {false && postCount && <span>{postCount} posts</span>}
        <a href="/random">Random</a>
        <a href="https://grantcuster.com">About</a>
      </nav>
    </div>
  );
};
