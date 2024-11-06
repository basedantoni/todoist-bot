import "dotenv/config";
import cron from "node-cron";
import express, { Application } from "express";
import { UserService } from "./services/userService";
import { TodoistService } from "./services/todoistService";
import { Task } from "./types";

const app: Application = express();

app.use(express.json());

app.get("/", async (req, res) => {
  const users = await UserService.indexUsers();

  const itemAddedActivity = await TodoistService.showItemActivity("added");
  const itemCompletedActivity = await TodoistService.showItemActivity(
    "completed"
  );
  const itemDeletedActivity = await TodoistService.showItemActivity("deleted");

  const syncResources = await TodoistService.readSyncResources();

  const snapshotMap = new Map<string, Array<Task>>();

  for (const user of users) {
    const activeTasks =
      snapshotMap
        .get(user.todoistId || "")
        ?.filter((task) => !task.is_completed).length || 0;

    const completedTasks =
      snapshotMap.get(user.todoistId || "")?.filter((task) => task.is_completed)
        .length || 0;

    // const snapshot = await SnapshotService.createSnapshot({
    //   activeTasks,
    //   completedTasks,
    //   userId: user.id,
    // });
  }

  res.send({ syncResources });
});

// Start cron jobs
cron.schedule(
  "0 13 * * *",
  async () => {
    try {
      const users = await UserService.indexUsers();

      console.log(users);
    } catch (error) {
      console.error("Error running task snapshot job:", error);
    }
  },
  {
    scheduled: true,
    timezone: "UTC",
  }
);

export default app;
