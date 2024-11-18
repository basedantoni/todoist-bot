import { SnapshotService } from "../services/snapshotService";
import { Request, Response } from "express";

export class SnapshotController {
  static async indexSnapshots(req: Request, res: Response) {
    const snapshots = await SnapshotService.indexSnapshots();
    res.json({ snapshots });
  }

  static async indexSnapshotsByUser(req: Request, res: Response) {
    const userId = req.params.userId;
    const startDate = req.query.start_date as string;

    try {
      const snapshots = await SnapshotService.indexSnapshotsByUser(
        userId,
        startDate
      );
      res.json({ snapshots });
    } catch (error) {
      res
        .status(500)
        .json({ error: "An error occurred while fetching snapshots." });
    }
  }

  static async showSnapshot(req: Request, res: Response) {
    const snapshot = await SnapshotService.showSnapshot(req.params.id);
    res.json({ snapshot });
  }

  static async showTotalCompletedTasks(req: Request, res: Response) {
    const totalCompletedTasks = await SnapshotService.showTotalCompletedTasks();
    res.json({ totalCompletedTasks });
  }
}
