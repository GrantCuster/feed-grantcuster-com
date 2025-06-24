import { Link } from "waku";
import { AddPostLink, LogoutLink } from "./AdminComponents";

export const Header = ({  postCount }: { postCount?: number }) => {
  return (
    <div className={`max-w-[600px] px-[1lh] departure-mono sm:px-0 w-full flex items-center justify-between`}>
      <div className="yellow py-4">
        <Link to="/" className="hover:underline">
          Feed
        </Link>
      </div>
      <div className="flex gap-3">
        <AddPostLink />
        <LogoutLink />
        {false && postCount && (
          <div className="pointer-events-none gray">
            {postCount} posts
          </div>
        )}
        <a
          href="/random"
          className="pointer-events-auto purple hover:underline"
        >
          Random
        </a>
      </div>
    </div>
  );
};
