import cron from "node-cron";
import { UserService } from "../services/userService";
import { TodoistService } from "../services/todoistService";

// Snapshot at 1 PM UTC
export const taskReportCron = cron.schedule(
  "0 13 * * *",
  async () => {
    try {
      const users = await UserService.indexUsers();
      const projectData = await TodoistService.indexProjectData();

      console.log(users);
      console.log(projectData);
    } catch (error) {
      console.error("Error running task report job:", error);
    }
  },
  {
    scheduled: true,
    timezone: "UTC",
  }
);
