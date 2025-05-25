import { sql } from "../shared/db";
import { MediaList } from "../shared/MediaList";
import { UploadType } from "../shared/types";

async function Media() {
  const uploads: UploadType[] = await sql`
    SELECT s3_key, file_type, created_at
    FROM uploads
    ORDER BY created_at DESC
  `;

  // should update to server function to check if logged in

  return <MediaList uploads={uploads} />;
}

export default Media;
