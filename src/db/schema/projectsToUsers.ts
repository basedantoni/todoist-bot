import { relations } from "drizzle-orm";
import { integer, sqliteTable, primaryKey } from "drizzle-orm/sqlite-core";
import { users } from "./users";
import { projects } from "./projects";

export const usersToProjects = sqliteTable(
  "users_to_projects",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    projectId: integer("project_id")
      .notNull()
      .references(() => projects.id),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.projectId] }),
  })
);
export const usersToProjectsRelations = relations(
  usersToProjects,
  ({ one }) => ({
    project: one(projects, {
      fields: [usersToProjects.projectId],
      references: [projects.id],
    }),
    user: one(users, {
      fields: [usersToProjects.userId],
      references: [users.id],
    }),
  })
);
