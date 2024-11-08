import "dotenv/config";
import { drizzle } from "drizzle-orm/libsql";

export const db =
  process.env.NODE_ENV === "production"
    ? drizzle({
        connection: {
          url: process.env.TURSO_DATABASE_URL!,
          authToken: process.env.TURSO_AUTH_TOKEN,
        },
      })
    : drizzle(process.env.DB_FILE_NAME!);
