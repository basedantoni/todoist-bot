import "dotenv/config";

import express, { Application } from "express";
const app: Application = express();

import { taskReportCron } from "./cron/taskReportCron";
import { deleteDailyReportCron } from "./cron/deleteDailyReportCron";

app.use(express.json());

app.get("/", async (req, res) => {
  res.send("Ponyo");
});

app.get("/health", async (req, res) => {
  res.send("OK");
});

taskReportCron.start();
deleteDailyReportCron.start();

export default app;
