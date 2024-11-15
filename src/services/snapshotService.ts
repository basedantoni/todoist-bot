import { db } from "../db/drizzle";
import { NewSnapshotParams, snapshots } from "../db/schema/snapshots";
import { eq } from "drizzle-orm";
export class SnapshotService {
  static async createSnapshot(snapshotParams: NewSnapshotParams) {
    const snapshotRow = await db
      .insert(snapshots)
      .values(snapshotParams)
      .returning();
    return snapshotRow[0];
  }

  static async indexSnapshots() {
    const snapshotRows = await db.select().from(snapshots);
    return snapshotRows;
  }

  static async indexSnapshotsByUser(userId: string) {
    const snapshotRows = await db
      .select()
      .from(snapshots)
      .where(eq(snapshots.userId, Number(userId)));
    return snapshotRows;
  }

  static async showSnapshot(id: string) {
    const snapshotRow = await db
      .select()
      .from(snapshots)
      .where(eq(snapshots.id, Number(id)));
    return snapshotRow[0];
  }
}
