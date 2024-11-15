import cron from "node-cron";
import { SyncTokenService } from "../services/syncTokensService";
import { TodoistService } from "../services/todoistService";

export const deleteDailyReportCron = cron.schedule(
  "0 12 * * *", // Delete at 12 PM UTC
  async () => {
    console.log("Deleting daily report");

    try {
      const lastSyncToken = await SyncTokenService.showLastSyncToken();
      const syncToken = lastSyncToken?.syncToken || "*";

      const syncResources = await TodoistService.readSyncResources(syncToken);
      const projectItems = syncResources.items.filter(
        (item) =>
          item.project_id === process.env.TODOIST_PROJECT_ID &&
          item.responsible_uid === process.env.BOT_USER_ID
      );

      for (const item of projectItems) {
        await TodoistService.deleteItem(item.id);
      }
    } catch (error) {
      console.error(error);
    }
  }
);
