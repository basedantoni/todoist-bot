import cron from "node-cron";
import { UserService } from "../services/userService";
import { TodoistService } from "../services/todoistService";
import { SyncTokenService } from "../services/syncTokensService";
import { UserStats } from "../types";
import { SnapshotService } from "../services/snapshotService";
import { isSameDay, isYesterday, getDay, isFuture, addDays } from "date-fns";
import { isWithinLast24Hours, calculateUserMoneyOwed, dayStringToNumber } from "../lib/report";

const processTasks = (userStatsMap: Map<string, UserStats>, userId: string) => {
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

                        for (const user of users) {
                                userStatsMap.set(user.todoistId!, {
                                        completedItems: 0,
                                        totalItems: 0,
                                        moneyOwed: 0,
                                })
                        }

                        const nonRecurringTasks = syncResources.items.filter((item) => {
                                const dueDate = item.due?.date
                                        ? new Date(item.due.date).setUTCHours(0, 0, 0, 0)
                                        : null;
                                const today = new Date(new Date().setUTCHours(0, 0, 0, 0));

                                return (
                                        item.project_id === process.env.TODOIST_PROJECT_ID &&
                                        dueDate &&
                                        !isSameDay(dueDate, today) &&
                                        !item.due?.is_recurring
                                );
                        });

                        const recurringTasks = syncResources.items.filter((item) => {
                                return (
                                        item.project_id === process.env.TODOIST_PROJECT_ID &&
                                        item.due?.is_recurring
                                );
                        })

                        for (const item of nonRecurringTasks) {
                                const userId = item.added_by_uid;
                                const dueDate = item.due?.date;
                                const completedAt = item.completed_at
                                        ? new Date(item.completed_at)
                                        : null;

                                const today = new Date(new Date().setUTCHours(0, 0, 0, 0));
                                // Skip if due date is in the future
                                if (!completedAt && dueDate && new Date(dueDate) > today) continue;

                                processTasks(userStatsMap, userId);

                                // check if due date is greater than two days prior
                                let date = new Date();
                                date.setDate(date.getDate() - 2);
                                if (
                                        completedAt &&
                                        dueDate &&
                                        isWithinLast24Hours(`${completedAt}`) &&
                                        new Date(dueDate) > date
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

                        function isWeekday(date: Date) {
                                const day = getDay(date);
                                return day !== 0 && day !== 6; // 0 = Sunday, 6 = Saturday
                        }

                        for (const item of recurringTasks) {
                                const userId = item.added_by_uid;
                                const stats = userStatsMap.get(userId);
                                const dueString = item.due?.string;
                                const dueDate = item.due?.date;
                                const today = new Date();
                                const yesterday = new Date(today)
                                yesterday.setDate(today.getDate() - 1)

                                if (!stats || !dueDate) continue;
                                const dueDateDate = addDays(dueDate, 1)


                                const day = dueString?.replace("every ", "");
                                if (!day) continue;


                                if (day === 'day') {
                                        isYesterday(dueDateDate) ?
                                                userStatsMap.set(userId, {
                                                        ...stats,
                                                        totalItems: stats?.totalItems + 1
                                                }) :
                                                userStatsMap.set(userId, {
                                                        ...stats,
                                                        totalItems: stats.totalItems + 1,
                                                        completedItems: stats.completedItems + 1
                                                })
                                } else if (day === 'workday' && isWeekday(yesterday)) {
                                        isYesterday(dueDateDate) ?
                                                userStatsMap.set(userId, {
                                                        ...stats,
                                                        totalItems: stats?.totalItems + 1
                                                }) :
                                                userStatsMap.set(userId, {
                                                        ...stats,
                                                        totalItems: stats.totalItems + 1,
                                                        completedItems: stats.completedItems + 1
                                                })
                                } else {
                                        const days = day.split(",").map(d => dayStringToNumber(d))
                                        if (days.includes(getDay(yesterday))) {
                                                isYesterday(dueDateDate) ? console.log(`Did Not Complete ${item.content}`) : console.log(`Add Completed For ${item.content}`)
                                                isYesterday(dueDateDate) ?
                                                        userStatsMap.set(userId, {
                                                                ...stats,
                                                                totalItems: stats?.totalItems + 1
                                                        }) :
                                                        userStatsMap.set(userId, {
                                                                ...stats,
                                                                totalItems: stats.totalItems + 1,
                                                                completedItems: stats.completedItems + 1
                                                        })
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
                        let description = "";
                        let anthonyMoneyOwed = 0;
                        let jacobMoneyOwed = 0;

                        for (const [userId, stats] of userStatsMap.entries()) {
                                const { moneyOwed } = stats;
                                const user = await UserService.showUserByTodoistId(userId);

                                if (user?.name === "anthony") {
                                        anthonyMoneyOwed = moneyOwed;
                                        description += `Anthony: ${stats.completedItems}/${stats.totalItems} items\n`;
                                } else if (user?.name === "jacob") {
                                        jacobMoneyOwed = moneyOwed;
                                        description += `Jacob: ${stats.completedItems}/${stats.totalItems} items\n`;
                                }
                        }

                        // Calculate who owes more money
                        const moneyOwedDifference = Math.abs(anthonyMoneyOwed - jacobMoneyOwed);
                        if (anthonyMoneyOwed > jacobMoneyOwed) {
                                message = `Anthony owes $${moneyOwedDifference}\n` + message;
                        } else if (jacobMoneyOwed > anthonyMoneyOwed) {
                                message = `Jacob owes $${moneyOwedDifference}\n` + message;
                        } else if (anthonyMoneyOwed === jacobMoneyOwed) {
                                message = "No one owes any money\n" + message;
                        }

                        if (userStatsMap.size > 0) {
                                await TodoistService.addItem({
                                        content: message,
                                        project_id: process.env.TODOIST_PROJECT_ID || "",
                                        labels: ["bot", "report"],
                                        description: description,
                                        responsible_uid: process.env.BOT_USER_ID || "",
                                });
                        }

                        for (const [userId, stats] of userStatsMap.entries()) {
                                let user = await UserService.showUserByTodoistId(userId);
                                if (!user) continue;

                                try {
                                        await SnapshotService.createSnapshot({
                                                activeTasks: stats.totalItems,
                                                completedTasks: stats.completedItems,
                                                userId: user.id,
                                        });

                                        console.log(`Created snapshot for ${user.name}`);
                                } catch (error) {
                                        console.error("Error creating snapshot:", error);
                                }
                        }
                } catch (error) {
                        console.error("Error running task snapshot job:", error);
                }

                console.log("Report Cron Job Completed");
        },
        {
                scheduled: true,
                timezone: "UTC",
        }
);
