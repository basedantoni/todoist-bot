import "dotenv/config";
import { defineConfig } from "drizzle-kit";

let config = defineConfig({
  out: "./src/db/migrations",
  schema: "./src/db/schema",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.DB_FILE_NAME!,
  },
});

if (process.env.NODE_ENV === "production") {
  config = defineConfig({
    out: "./src/db/migrations",
    schema: "./src/db/schema",
    dialect: "turso",
    dbCredentials: {
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN!,
    },
  });
}

export default config;
