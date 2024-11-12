import "dotenv/config";

import express, { Application } from "express";
const app: Application = express();

import { taskReportCron } from "./cron/taskReportCron";

app.use(express.json());

app.get("/health", async (req, res) => {
  res.send("CI/CD");
});

taskReportCron.start();

export default app;
