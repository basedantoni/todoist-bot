import { Router } from "express";
import { SnapshotController } from "../controllers/snapshotController";

const router: Router = Router();

router.get("/", async (req, res) => {
  await SnapshotController.indexSnapshots(req, res);
});

router.get("/completed", async (req, res) => {
  await SnapshotController.showTotalCompletedTasks(req, res);
});

router.get("/:id", async (req, res) => {
  await SnapshotController.showSnapshot(req, res);
});

router.get("/user/:userId", async (req, res) => {
  await SnapshotController.indexSnapshotsByUser(req, res);
});

export default router;
