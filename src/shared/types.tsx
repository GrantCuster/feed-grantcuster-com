export type PostType = {
  id: number;
  title: string | null;
  content: string;
  slug: string;
  created_at: Date;
  tags: string[];
};
