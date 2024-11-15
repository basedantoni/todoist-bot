import { SnapshotService } from "../services/snapshotService";
import { Request, Response } from "express";

export class SnapshotController {
  static async indexSnapshots(req: Request, res: Response) {
    const snapshots = await SnapshotService.indexSnapshots();
    res.json({ snapshots });
  }

  static async indexSnapshotsByUser(req: Request, res: Response) {
    const snapshots = await SnapshotService.indexSnapshotsByUser(
      req.params.userId
    );
    res.json({ snapshots });
  }

  static async showSnapshot(req: Request, res: Response) {
    const snapshot = await SnapshotService.showSnapshot(req.params.id);
    res.json({ snapshot });
  }
}
