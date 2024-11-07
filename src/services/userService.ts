import { db } from "../db/drizzle";
import { users } from "../db/schema/users";
import { eq } from "drizzle-orm";

export class UserService {
  static async indexUsers() {
    const userRows = await db.select().from(users);
    return userRows;
  }

  static async showUser(userId: number) {
    const user = await db.select().from(users).where(eq(users.id, userId));
    return user[0];
  }

  static async showUserByTodoistId(todoistId: string) {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.todoistId, todoistId));
    return user[0];
  }
}
