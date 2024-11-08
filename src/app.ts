import "dotenv/config";
import cron from "node-cron";
import express, { Application } from "express";

import twilio from "twilio";
import { UserService } from "./services/userService";
import { TodoistService } from "./services/todoistService";
import { SyncTokenService } from "./services/syncTokensService";
import { Item, UserStats } from "./types";

const app: Application = express();

app.use(express.json());

app.get("/", async (req, res) => {
  const users = await UserService.indexUsers();
  res.send(users);
});

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
cron.schedule(
  "0 13 * * *",
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
        (item) => item.project_id === process.env.TODOIST_PROJECT_ID
      );

      for (const item of projectItems) {
        const userId = item.added_by_uid;
        const dueDate = item.due?.date;

        if (dueDate && !isWithinLast24Hours(`${dueDate}T23:59:59Z`)) continue;

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
      }

      const completedItems = await TodoistService.getCompletedItems();
      const filteredCompletedItems: Item[] = completedItems.items.filter(
        (item: Item) => {
          if (!item.completed_at || !item.due?.date) return false;
          const completedDate = new Date(item.completed_at);
          const dueDate = new Date(item.due.date);
          const timeDiff = Math.abs(
            completedDate.getTime() - dueDate.getTime()
          );
          const now = new Date();
          const completedWithin24h =
            now.getTime() - completedDate.getTime() <= 24 * 60 * 60 * 1000;

          return completedWithin24h && timeDiff <= 24 * 60 * 60 * 1000;
        }
      );

      for (const item of filteredCompletedItems) {
        const userId = item.added_by_uid;

        if (userStatsMap.has(userId)) {
          const stats: UserStats | undefined = userStatsMap.get(userId);
          if (!stats) continue;

          userStatsMap.set(userId, {
            ...stats,
            completedItems: stats.completedItems + 1,
          });
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
      let message = "Todoist Bot Report\n\n";
      let anthonyMoneyOwed = 0;
      let jacobMoneyOwed = 0;

      for (const [userId, stats] of userStatsMap.entries()) {
        const { moneyOwed } = stats;
        const user = await UserService.showUserByTodoistId(userId);

        if (user?.name === "anthony") {
          anthonyMoneyOwed = stats.moneyOwed;
          message += `Anthony completed ${stats.completedItems} out of ${stats.totalItems} items\n\n`;
        } else {
          jacobMoneyOwed = stats.moneyOwed;
          message += `Jacob completed ${stats.completedItems} out of ${stats.totalItems} items\n\n`;
        }
      }

      // Calculate who owes more money
      const moneyOwedDifference = Math.abs(anthonyMoneyOwed - jacobMoneyOwed);
      if (anthonyMoneyOwed > jacobMoneyOwed) {
        message += `Anthony owes $${moneyOwedDifference}`;
      } else if (jacobMoneyOwed > anthonyMoneyOwed) {
        message += `Jacob owes $${moneyOwedDifference}`;
      }

      if (userStatsMap.size > 0) {
        // Send SMS to users
        const client = twilio(
          process.env.TWILIO_ACCOUNT_SID,
          process.env.TWILIO_AUTH_TOKEN
        );

        await client.messages.create({
          body: message,
          from: process.env.TWILIO_PHONE_NUMBER || "",
          to: process.env.ANTHONY_PHONE_NUMBER || "",
        });

        await client.messages.create({
          body: message,
          from: process.env.TWILIO_PHONE_NUMBER || "",
          to: process.env.JACOB_PHONE_NUMBER || "",
        });
      }

      console.log(message);
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
