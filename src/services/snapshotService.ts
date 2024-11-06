import { db } from "../db/drizzle";
import { NewSnapshotParams, snapshots } from "../db/schema/snapshots";

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
}
