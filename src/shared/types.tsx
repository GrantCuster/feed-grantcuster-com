export type PostType = {
  id: number;
  title: string | null;
  content: string;
  slug: string;
  created_at: Date;
  tags: string[];
};

export type UploadType = {
  s3_key: string;
  file_type: string;
  created_at: Date;
  description?: string;
};

export type MediaDescriptionType = {
  url: string;
  description: string;
  created_at: Date;
};
