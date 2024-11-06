import "dotenv/config";

import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";

const runMigrate = async () => {
  if (!process.env.DB_FILE_NAME) {
    throw new Error("DB_FILE_NAME is not defined");
  }

  const db = drizzle(process.env.DB_FILE_NAME!);

  console.log("⏳ Running migrations...");

  const start = Date.now();

  await migrate(db, { migrationsFolder: "src/db/migrations" });

  const end = Date.now();

  console.log("✅ Migrations completed in", end - start, "ms");

  process.exit(0);
};

runMigrate().catch((err) => {
  console.error("❌ Migration failed");
  console.error(err);
  process.exit(1);
});
