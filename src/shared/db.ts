import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

export const sql = postgres(databaseUrl);

let vectorSqlClient: ReturnType<typeof postgres> | null = null;

export function getVectorSql() {
  const vectorDatabaseUrl = process.env.PGVECTOR_DATABASE_URL;
  if (!vectorDatabaseUrl) {
    throw new Error("PGVECTOR_DATABASE_URL is required");
  }

  if (!vectorSqlClient) {
    vectorSqlClient = postgres(vectorDatabaseUrl);
  }

  return vectorSqlClient;
}

export function toVectorLiteral(values: number[] | string): string {
  if (typeof values === "string") {
    return values;
  }

  return `[${values.join(",")}]`;
}
