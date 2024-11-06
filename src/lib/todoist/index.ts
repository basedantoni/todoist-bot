const TODOIST_API_KEY = "07056cdbd1c84cd28b13c9b32878378839deee8b";
const PROJECT_ID = "2342805965";

const ANTHONY_ID = "11686379";
const JACOB_ID = "45187088";

const TASK_ENDPOINT = "https://api.todoist.com/rest/v2/tasks";

const getProjectBId = async (id: string) => {
  const projectResponse = await fetch(
    `https://api.todoist.com/rest/v2/projects/${id}`,
    {
      headers: {
        Authorization: `Bearer ${TODOIST_API_KEY}`,
      },
    }
  );

  if (!projectResponse.ok) {
    throw new Error("Failed to fetch projects");
  }

  return projectResponse.json();
};

export const getTasksSnapshot = async (projectId: string) => {
  const projectResponse = await fetch(
    `${TASK_ENDPOINT}?project_id=${projectId}`,
    {
      headers: {
        Authorization: `Bearer ${TODOIST_API_KEY}`,
      },
    }
  );

  if (!projectResponse.ok) {
    throw new Error("Failed to fetch tasks");
  }

  return projectResponse.json();
};
