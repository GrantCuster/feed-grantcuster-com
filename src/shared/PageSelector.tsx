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
    <div className="flex gap-2 items-center">
      <select
        className="rounded bg-hard-black px-2 py-0.5"
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
      <div className="shrink-0">of {pageCount}</div>
    </div>
  );
}
