import { getVectorSql } from "../shared/db";
import { Header } from "../shared/header";
import { MediaDescriptionList } from "../shared/MediaDescriptionList";
import { MediaDescriptionType } from "../shared/types";

async function MediaDescriptionsPage() {
  const vectorSql = getVectorSql();
  const items: MediaDescriptionType[] = await vectorSql`
    SELECT url, description, created_at
    FROM media_descriptions
    ORDER BY created_at DESC, url DESC
  `;

  return (
    <div className="container">
      <Header />
      <MediaDescriptionList items={items} />
    </div>
  );
}

export default MediaDescriptionsPage;

export const getConfig = async () => {
  return {
    render: "dynamic",
  } as const;
};
