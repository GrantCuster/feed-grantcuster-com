import TagPage from './[pageNum]'

export default TagPage;

export const getConfig = async () => {
  return {
    render: "dynamic",
  } as const;
};
