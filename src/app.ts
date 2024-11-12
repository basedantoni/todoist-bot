import "dotenv/config";

import express, { Application } from "express";
const app: Application = express();

import { taskReportCron } from "./cron/taskReportCron";
import { TodoistService } from "./services/todoistService";

app.use(express.json());

app.get("/resources", async (req, res) => {
  const resources = await TodoistService.readSyncResources(
    "vj_bG1caN1hpvlQwMAuGQ92Ui9wVhToinzvCA98cSQCHa4VUg5Pw_KylEL0r3Lf_I7tnuadkN3SwENqSzyNrdEzuuTsxzcuOd_r3fSHee8HpYb8"
  );
  res.json(resources);
});

app.get("/health", async (req, res) => {
  res.send("OK");
});

taskReportCron.start();

export default app;
