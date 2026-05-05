"use client";

export function PageSelector({
  page,
  pageCount,
  baseLink,
}: {
  page: number;
  pageCount: number;
  baseLink: string;
}) {
  return (
    <span>
      Page
      <select
        value={page}
        onChange={(e) => {
          window.location.href = `${baseLink}${parseInt(e.target.value)}`;
        }}
      >
        {[...Array(pageCount)].map((_, i) => (
          <option key={i} value={i + 1}>
            {i + 1}
          </option>
        ))}
      </select>
      of {pageCount}
    </span>
  );
}
