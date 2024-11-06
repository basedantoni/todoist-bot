import { desc } from "drizzle-orm";
import { db } from "../db/drizzle";
import { NewSyncTokenParams, syncTokens } from "../db/schema/syncTokens";

export class SyncTokenService {
  static async createSyncToken(syncTokenParams: NewSyncTokenParams) {
    const syncTokenRow = await db
      .insert(syncTokens)
      .values(syncTokenParams)
      .returning();
    return syncTokenRow[0];
  }

  static async indexSyncTokens() {
    const syncTokenRows = await db.select().from(syncTokens);
    return syncTokenRows;
  }

  static async showLastSyncToken() {
    const syncTokenRow = await db
      .select()
      .from(syncTokens)
      .orderBy(desc(syncTokens.createdAt))
      .limit(1);
    return syncTokenRow[0];
  }
}
