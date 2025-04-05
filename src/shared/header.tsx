import { Link } from "waku";
import { containerWidth } from "../shared/consts";

export const Header = () => {
  return (
    <div className={`max-w-[600px] w-full`}>
      <div className="yellow py-4">
        <Link to="/" className="hover:underline">
          Grant's Garden
        </Link>
      </div>
    </div>
  );
};
