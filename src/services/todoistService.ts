import "dotenv/config";
import { NewTask, SyncResources, TaskEventType } from "../types";

const TODOIST_API_KEY = process.env.TODOIST_API_KEY;
const PROJECT_ID = process.env.TODOIST_PROJECT_ID;

const TODOIST_REST_URL = "https://api.todoist.com/rest/v2";
const TODOIST_SYNC_URL = "https://api.todoist.com/sync/v9";

export class TodoistService {
  static async indexProjectData() {
    const projectResponse = await fetch(
      `${TODOIST_SYNC_URL}/projects/get_data?project_id=${PROJECT_ID}`,
      {
        headers: {
          Authorization: `Bearer ${TODOIST_API_KEY}`,
        },
      }
    );

    if (!projectResponse.ok) {
      throw new Error("Failed to fetch project data");
    }

    return projectResponse.json();
  }

  static async indexPastDayCompletedTasks() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const formattedDate = yesterday.toISOString().split(".")[0];

    const completedTasksResponse = await fetch(
      `${TODOIST_SYNC_URL}/completed/get_all?project_id=${PROJECT_ID}&limit=20&since=${formattedDate}`,
      {
        headers: {
          Authorization: `Bearer ${TODOIST_API_KEY}`,
        },
      }
    );

    if (!completedTasksResponse.ok) {
      throw new Error(
        `Failed to fetch completed tasks: ${completedTasksResponse.status} ${completedTasksResponse.statusText}`
      );
    }

    return completedTasksResponse.json();
  }

  static async showItemActivity(eventType: TaskEventType) {
    const activityResponse = await fetch(
      `${TODOIST_SYNC_URL}/activity/get?object_type=item&event_type=${eventType}&parent_project_id=${PROJECT_ID}&limit=20`,
      {
        headers: {
          Authorization: `Bearer ${TODOIST_API_KEY}`,
        },
      }
    );

    if (!activityResponse.ok) {
      throw new Error("Failed to fetch item added activity");
    }

    return activityResponse.json();
  }

  static async readSyncResources(
    syncToken: string = "*"
  ): Promise<SyncResources> {
    const resourcesResponse = await fetch(
      `${TODOIST_SYNC_URL}/sync?sync_token=${syncToken}&resource_types=["items","completed_info","stats"]`,
      {
        headers: {
          Authorization: `Bearer ${TODOIST_API_KEY}`,
        },
      }
    );

    if (!resourcesResponse.ok) {
      throw new Error("Failed to fetch sync resources");
    }

    return resourcesResponse.json();
  }

  static async getCompletedItems() {
    const completedItemsResponse = await fetch(
      `${TODOIST_SYNC_URL}/archive/items?project_id=${PROJECT_ID}&limit=20`,
      {
        headers: {
          Authorization: `Bearer ${TODOIST_API_KEY}`,
        },
      }
    );

    if (!completedItemsResponse.ok) {
      throw new Error("Failed to fetch completed items");
    }

    return completedItemsResponse.json();
  }

  static async addItem({ content, project_id, labels, description }: NewTask) {
    const headers = {
      Authorization: `Bearer ${TODOIST_API_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    };

    const commands = [
      {
        type: "item_add",
        temp_id: crypto.randomUUID(),
        uuid: crypto.randomUUID(),
        args: {
          content,
          project_id,
          labels,
          description,
        },
      },
    ];

    // Construct the body as form data
    const body = new URLSearchParams({
      commands: JSON.stringify(commands),
    });

    const addItemResponse = await fetch(`${TODOIST_SYNC_URL}/sync`, {
      method: "POST",
      headers,
      body: body.toString(),
    });

    if (!addItemResponse.ok) {
      console.log(addItemResponse);
      throw new Error("Failed to add item");
    }

    return addItemResponse.json();
  }
}
