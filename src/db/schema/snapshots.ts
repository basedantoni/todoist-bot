import { relations, sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { users } from "./users";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const snapshots = sqliteTable("snapshots", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  activeTasks: integer().notNull(),
  completedTasks: integer().notNull(),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updated_at").default(sql`(CURRENT_TIMESTAMP)`),
  userId: integer("user_id").references(() => users.id),
});

export const snapshotsRelations = relations(snapshots, ({ one }) => ({
  user: one(users, {
    fields: [snapshots.userId],
    references: [users.id],
  }),
}));

const baseSchema = createSelectSchema(snapshots);

export const insertSnapshotSchema = createInsertSchema(snapshots).omit({
  createdAt: true,
  updatedAt: true,
});
export const insertSnapshotParams = baseSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const snapshotIdSchema = baseSchema.pick({ id: true });

export type Snapshot = typeof snapshots.$inferSelect;
export type NewSnapshot = z.infer<typeof insertSnapshotSchema>;
export type NewSnapshotParams = z.infer<typeof insertSnapshotParams>;
export type SnapshotId = z.infer<typeof snapshotIdSchema>["id"];
