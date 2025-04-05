import type { PageProps } from "waku/router";
import { PostEditor } from "../shared/PostEditor";
import { PostType } from "../shared/types";

async function Post({ slug }: PageProps<"/post/[slug]">) {
  const blankPost = {
    id: 0,
    title: "",
    content: "",
    slug: "",
    created_at: (new Date()).toUTCString(),
    tags: [],
  } as PostType;

  return <PostEditor post={blankPost} />;
}

export default Post;

export const getConfig = async () => {
  return {
    render: 'dynamic',
  } as const;
};
