import { getVectorSql, sql } from "../shared/db";
import { mediaBaseUrl } from "../shared/consts";
import { MediaList } from "../shared/MediaList";
import { UploadType } from "../shared/types";

async function Media() {
  const uploads: UploadType[] = await sql`
    SELECT s3_key, file_type, created_at
    FROM uploads
    ORDER BY created_at DESC
  `;
  let descriptionMap = new Map<string, string>();

  try {
    const vectorSql = getVectorSql();
    const descriptions = await vectorSql<{ url: string; description: string }[]>`
      SELECT url, description
      FROM media_descriptions
    `;
    descriptionMap = new Map(
      descriptions.map((row) => [row.url, row.description]),
    );
  } catch (error) {
    console.error("Unable to load media descriptions", error);
  }

  // should update to server function to check if logged in

  return (
    <MediaList
      uploads={uploads.map((upload) => ({
        ...upload,
        description: descriptionMap.get(`${mediaBaseUrl}${upload.s3_key}`) ?? "",
      }))}
    />
  );
}

export default Media;
