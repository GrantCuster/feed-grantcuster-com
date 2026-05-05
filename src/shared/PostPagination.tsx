import { postsPerPage } from "./consts";

export function PostPagination({
  baseLink,
  page,
  totalPostCount,
}: {
  baseLink: string;
  page: number;
  totalPostCount: number;
  postsOnPage: number;
}) {
  const pageCount = Math.ceil(totalPostCount / postsPerPage);
  return (
    <div className="pagination">
      {page > 1 ? (
        <a href={`${baseLink}${page - 1}`}>← Previous</a>
      ) : (
        <span />
      )}
      {page < pageCount ? (
        <a href={`${baseLink}${page + 1}`}>Next →</a>
      ) : (
        <span />
      )}
    </div>
  );
}
