import "dotenv/config";

import express, { Application } from "express";
const app: Application = express();

import { taskReportCron } from "./cron/taskReportCron";

app.use(express.json());

app.get("/", async (req, res) => {
  res.send("Ponyo");
});

app.get("/health", async (req, res) => {
  res.send("OK");
});

taskReportCron.start();

export default app;
