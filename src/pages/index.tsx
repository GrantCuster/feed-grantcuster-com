import PostPage from './page/[pageNum]'

export default PostPage;

export const getConfig = async () => {
  return {
    render: "dynamic",
  } as const;
};
