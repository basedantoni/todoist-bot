import cron from "node-cron";
import { UserService } from "../services/userService";
import { TodoistService } from "../services/todoistService";
import { SyncTokenService } from "../services/syncTokensService";
import { UserStats } from "../types";

const isWithinLast24Hours = (date: string | number | Date) => {
  const now = new Date();
  const dateToCheck = new Date(date);
  const timeDifference = now.getTime() - dateToCheck.getTime();
  return timeDifference <= 24 * 60 * 60 * 1000; // 24 hours in milliseconds
};

const calculateUserMoneyOwed = ({ completedItems, totalItems }: UserStats) => {
  const moneyMultiplier = Number(process.env.MONEY_MULTIPLIER);
  return (totalItems - completedItems) * moneyMultiplier;
};

// Start cron jobs
export const taskReportCron = cron.schedule(
  "0 13 * * *", // Snapshot at 1 PM UTC
  async () => {
    try {
      // Get last sync token
      const lastSyncToken = await SyncTokenService.showLastSyncToken();
      const syncToken = lastSyncToken?.syncToken || "*";

      // Get users
      const users = await UserService.indexUsers();
      if (users.length === 0) {
        throw new Error("No users found");
      }

      // Read sync resources
      const syncResources = await TodoistService.readSyncResources(syncToken);

      // Create new sync token
      const newSyncToken = await SyncTokenService.createSyncToken({
        syncToken: syncResources.sync_token,
      });
      if (!newSyncToken) {
        throw new Error("Failed to create sync token");
      }

      // Generate report
      const userStatsMap: Map<string, UserStats> = new Map();
      const projectItems = syncResources.items.filter(
        (item) =>
          item.project_id === process.env.TODOIST_PROJECT_ID &&
          ["45187088", "11686379"].includes(item.added_by_uid)
      );

      for (const item of projectItems) {
        const userId = item.added_by_uid;
        const dueDate = item.due?.date;

        if (dueDate && !isWithinLast24Hours(`${dueDate}`)) continue;

        if (userStatsMap.has(userId)) {
          const stats: UserStats | undefined = userStatsMap.get(userId) || {
            completedItems: 0,
            totalItems: 0,
            moneyOwed: 0,
          };

          userStatsMap.set(userId, {
            ...stats,
            totalItems: stats.totalItems + 1,
          });
        } else {
          userStatsMap.set(userId, {
            completedItems: 0,
            totalItems: 1,
            moneyOwed: 0,
          });
        }

        const completedAt = item.completed_at
          ? new Date(item.completed_at)
          : null;
        console.log("Item Details", {
          userId,
          dueDate,
          completedAt: completedAt ?? null,
          content: item.content,
        });

        if (
          completedAt &&
          dueDate &&
          isWithinLast24Hours(`${completedAt}`) &&
          new Date(dueDate) > new Date(completedAt)
        ) {
          const stats = userStatsMap.get(userId);
          if (stats) {
            userStatsMap.set(userId, {
              ...stats,
              completedItems: stats.completedItems + 1,
            });
          }
        }
      }

      // Calculate money owed
      for (const [userId, stats] of userStatsMap.entries()) {
        const moneyOwed = calculateUserMoneyOwed(stats);
        userStatsMap.set(userId, {
          ...stats,
          moneyOwed,
        });
      }

      // Build message
      let message = "";
      let anthonyMoneyOwed = 0;
      let jacobMoneyOwed = 0;

      for (const [userId, stats] of userStatsMap.entries()) {
        const { moneyOwed } = stats;
        const user = await UserService.showUserByTodoistId(userId);

        if (user?.name === "anthony") {
          anthonyMoneyOwed = moneyOwed;
          message += `Anthony completed ${stats.completedItems}/${stats.totalItems} items\n`;
        } else {
          jacobMoneyOwed = moneyOwed;
          message += `Jacob completed ${stats.completedItems}/${stats.totalItems} items\n`;
        }
      }

      // Calculate who owes more money
      const moneyOwedDifference = Math.abs(anthonyMoneyOwed - jacobMoneyOwed);
      if (anthonyMoneyOwed > jacobMoneyOwed) {
        message = `Anthony owes $${moneyOwedDifference}\n` + message;
      } else if (jacobMoneyOwed > anthonyMoneyOwed) {
        message = `Jacob owes $${moneyOwedDifference}\n` + message;
      }

      if (userStatsMap.size > 0) {
        await TodoistService.addItem({
          content: message,
          project_id: process.env.TODOIST_PROJECT_ID || "",
          labels: ["bot", "report"],
          description: "Todoist Bot Report",
          responsible_uid: process.env.BOT_USER_ID || "",
        });
      }
    } catch (error) {
      console.error("Error running task snapshot job:", error);
    }
  },
  {
    scheduled: true,
    timezone: "UTC",
  }
);
