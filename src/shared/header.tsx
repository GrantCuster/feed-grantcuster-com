import { Link } from "waku";
import {
  AddPostLink,
  EmbeddingSyncButton,
  LogoutLink,
  MediaDescriptionsLink,
} from "./AdminComponents";

export const Header = ({ postCount }: { postCount?: number }) => {
  return (
    <div className="feed-header">
      <Link to="/" style={{ color: "var(--accent-yellow)" }}>Feed</Link>
      <nav>
        <AddPostLink />
        <MediaDescriptionsLink />
        <EmbeddingSyncButton />
        <LogoutLink />
        {false && postCount && <span>{postCount} posts</span>}
        <a href="/random" style={{ color: "var(--accent-aqua)" }}>Random</a>
        <a href="https://grantcuster.com" style={{ color: "var(--accent-aqua)" }}>About</a>
      </nav>
    </div>
  );
};
