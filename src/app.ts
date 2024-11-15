import "dotenv/config";

import express, { Application } from "express";
const app: Application = express();

import { taskReportCron } from "./cron/taskReportCron";
import { deleteDailyReportCron } from "./cron/deleteDailyReportCron";
import { SnapshotController } from "./controllers/snapshotController";

app.use(express.json());

app.get("/", async (req, res) => {
  res.send("Ponyo");
});

app.get("/health", async (req, res) => {
  res.send("OK");
});

app.get("/api/snapshots", async (req, res) => {
  await SnapshotController.indexSnapshots(req, res);
});

app.get("/api/snapshots/:id", async (req, res) => {
  await SnapshotController.showSnapshot(req, res);
});

app.get("/api/snapshots/user/:userId", async (req, res) => {
  await SnapshotController.indexSnapshotsByUser(req, res);
});

taskReportCron.start();
deleteDailyReportCron.start();

export default app;
