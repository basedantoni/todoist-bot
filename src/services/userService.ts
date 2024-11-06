import { db } from "../db/drizzle";
import { users } from "../db/schema/users";

export class UserService {
  static async indexUsers() {
    const userRows = await db.select().from(users);
    return userRows;
  }
}
