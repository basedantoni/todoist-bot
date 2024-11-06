import { sql } from "drizzle-orm";
import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
export const syncTokens = sqliteTable("sync_tokens", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  syncToken: text("sync_token").notNull(),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updated_at").default(sql`(CURRENT_TIMESTAMP)`),
});

const baseSchema = createSelectSchema(syncTokens);

export const insertSyncTokenSchema = createInsertSchema(syncTokens).omit({
  createdAt: true,
  updatedAt: true,
});
export const insertSyncTokenParams = baseSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateSyncTokenSchema = baseSchema;
export const updateSyncTokenParams = baseSchema.extend({}).omit({});
export const syncTokenIdSchema = baseSchema.pick({ id: true });

export type SyncTokens = typeof syncTokens.$inferSelect;
export type NewSyncToken = z.infer<typeof insertSyncTokenSchema>;
export type NewSyncTokenParams = z.infer<typeof insertSyncTokenParams>;
export type UpdateSyncTokenParams = z.infer<typeof updateSyncTokenParams>;
export type SyncTokenId = z.infer<typeof syncTokenIdSchema>["id"];
