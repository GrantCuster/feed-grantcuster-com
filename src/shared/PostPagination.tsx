import { postsPerPage } from "./consts";

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
    <div className="flex items-center text-sm justify-between aqua">
      {page > 1 ? (
        <a href={`${baseLink}${page - 1}`} className="w-1/2 py-2 hover:underline">
          Previous
        </a>
      ) : (
        <div className="w-1/2 py-2"></div>
      )}

      <div className="flex gap-3">
        <div className="shrink-0 hidden">{postsOnPage} posts</div>
        <div className="shrink-0">
          {page} of {pageCount}
        </div>
      </div>

      {page < pageCount ? (
        <a href={`${baseLink}${page + 1}`} className="w-1/2 py-2 text-right hover:underline">
          Next
        </a>
      ) : (
        <div className="w-1/2 py-2"></div>
      )}
    </div>
  );
}
