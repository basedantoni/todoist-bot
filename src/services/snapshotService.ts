import { db } from "../db/drizzle";
import { NewSnapshotParams, snapshots } from "../db/schema/snapshots";
import { eq, sum, and, gt } from "drizzle-orm";
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

  static async indexSnapshotsByUser(userId: string, startDate?: string) {
    const conditions = [eq(snapshots.userId, Number(userId))];

    if (startDate) {
      // Assuming startDate is in a valid ISO format
      const startDateParsed = new Date(startDate).toISOString();
      conditions.push(gt(snapshots.createdAt, startDateParsed));
    }

    const snapshotRows = await db
      .select()
      .from(snapshots)
      .where(and(...conditions));

    return snapshotRows;
  }

  static async showSnapshot(id: string) {
    const snapshotRow = await db
      .select()
      .from(snapshots)
      .where(eq(snapshots.id, Number(id)));
    return snapshotRow[0];
  }

  static async showTotalCompletedTasks() {
    const totalCompletedTasks = await db
      .select({
        total: sum(snapshots.completedTasks),
      })
      .from(snapshots);
    return totalCompletedTasks[0];
  }
}
