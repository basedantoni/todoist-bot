import { relations, sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { usersToProjects } from "./projectsToUsers";

export const projects = sqliteTable("projects", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  todoistId: text("todoist_id"),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updated_at").default(sql`(CURRENT_TIMESTAMP)`),
});

export const projectsRelations = relations(projects, ({ many }) => ({
  usersToProjects: many(usersToProjects),
}));

// createSelectSchema(users).omit(<omitted-fields>)
const baseSchema = createSelectSchema(projects);

export const insertProjectSchema = createInsertSchema(projects).omit({
  createdAt: true,
  updatedAt: true,
});
export const insertProjectParams = baseSchema.omit({ id: true });

export const updateProjectSchema = baseSchema;
export const updateProjectParams = baseSchema.extend({}).omit({});
export const projectIdSchema = baseSchema.pick({ id: true });

export type Projects = typeof projects.$inferSelect;
export type NewProject = z.infer<typeof insertProjectSchema>;
export type NewProjectParams = z.infer<typeof insertProjectParams>;
export type UpdateProjectParams = z.infer<typeof updateProjectParams>;
export type ProjectId = z.infer<typeof projectIdSchema>["id"];
