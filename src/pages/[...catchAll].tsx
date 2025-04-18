import type { PageProps } from "waku/router";

// Create dashboard page
export default async function DashboardPage({
  catchAll,
}: PageProps<"/app/[...catchAll]">) {
  console.log(catchAll);
  // try rewriting to post
  if (catchAll.length === 1) {
    return (
      <script
        dangerouslySetInnerHTML={{
          __html: `window.location.href = "/post/${catchAll[0]}";`,
        }}
      />
    );
  }

  return (
    <>
      <div>test</div>
    </>
  );
}

export const getConfig = async () => {
  return {
    render: "dynamic",
  } as const;
};
