import { postsPerPage } from "./consts";
import { PageSelector } from "./PageSelector";

export function PostPagination({
  baseLink,
  page,
  totalPostCount,
  postsOnPage,
}: {
  baseLink: string;
  page: number;
  totalPostCount: number;
  postsOnPage: number;
}) {
  const pageCount = Math.ceil(totalPostCount / postsPerPage);
  return (
    <div className="flex text-sm bg-hard-black items-center px-[1lh] mb-[2px] w-full justify-between aqua">
      {page > 1 ? (
        <div className="w-1/2 flex justify-start">
          <a href={`${baseLink}${page - 1}`} className="py-2 hover:underline">
            Previous
          </a>
        </div>
      ) : (
        <div className="w-1/2 py-2"></div>
      )}

      <PageSelector page={page} pageCount={pageCount} baseLink={baseLink} />

      {page < pageCount ? (
        <div className="w-1/2 flex justify-end">
          <a
            href={`${baseLink}${page + 1}`}
            className="py-2 text-right hover:underline"
          >
            Next
          </a>
        </div>
      ) : (
        <div className="w-1/2 py-2"></div>
      )}
    </div>
  );
}
