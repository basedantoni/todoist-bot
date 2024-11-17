import { db } from "../db/drizzle";
import { projects } from "../db/schema/projects";
import { eq } from "drizzle-orm";
import { usersToProjects } from "../db/schema/projectsToUsers";
import { users } from "../db/schema/users";

export class ProjectService {
  static async indexProjects() {
    const projectRows = await db.select().from(projects);
    return projectRows;
  }

  static async showProjectUsers(projectId: string) {
    const projectUsers = await db
      .select({
        id: users.id,
        name: users.name,
        todoistId: users.todoistId,
      })
      .from(usersToProjects)
      .leftJoin(users, eq(usersToProjects.userId, users.id))
      .where(eq(usersToProjects.projectId, Number(projectId)));
    return projectUsers;
  }
}
