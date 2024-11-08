import { NewUser, users } from "./schema/users";
import { db } from "./drizzle";

const runSeed = async () => {
  if (!process.env.DB_FILE_NAME) {
    throw new Error("DB_FILE_NAME is not defined");
  }

  console.log("⏳ Seeding...");

  const data: NewUser[] = [
    {
      name: "anthony",
      todoistId: "11686379",
    },
    {
      name: "jacob",
      todoistId: "45187088",
    },
  ];

  db.insert(users).values(data);
};

runSeed().catch((err) => {
  console.error("❌ Seeding failed");
  console.error(err);
  process.exit(1);
});
