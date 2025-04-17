import { Link } from "waku";
import { AddPostLink, LogoutLink } from "./AdminComponents";

export const Header = () => {
  return (
    <div className={`max-w-[600px] w-full flex items-center justify-between`}>
      <div className="yellow py-4">
        <Link to="/" className="hover:underline">
          Grant's Garden
        </Link>
      </div>
      <div className="flex gap-3">
        <AddPostLink />
        <LogoutLink />
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
