import "dotenv/config";

import express, { Application } from "express";
const app: Application = express();

import winston from "winston";
import { taskReportCron } from "./cron/taskReportCron";
import { deleteDailyReportCron } from "./cron/deleteDailyReportCron";
import snapshotRoutes from "./routes/snapshotRoutes";
import projectRoutes from "./routes/projectRoutes";

app.use(express.json());

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [new winston.transports.Console()],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

app.get("/", async (req, res) => {
  res.send("Ponyo");
});

app.get("/health", async (req, res) => {
  res.send("OK");
});

app.use("/api/snapshots", snapshotRoutes);
app.use("/api/projects", projectRoutes);

taskReportCron.start();
deleteDailyReportCron.start();

export default app;
