import csv from "csv-parser";
import fs from "fs";
import path from "path";
import { TodoistService } from "../services/todoistService";

export const bulkCreateTasks = (input: string) => {
        const results: any[] = []
        const filePath = path.resolve(__dirname, input);

        fs.createReadStream(filePath)
                .pipe(csv(['Type', 'Difficulty', 'Name']))
                .on('data', (data) => results.push(data))
                .on('end', async () => {
                        for (const task of results) {
                                const newTask = await TodoistService.addItem({
                                        content: task.Name,
                                        project_id: process.env.TODOIST_LEETCODE_PROJECT_ID!,
                                        // add section id to the addItem options
                                        labels: [task.Difficulty, task.Type],
                                        description: "", // add link to problem as the description
                                        responsible_uid: "",
                                })
                                console.log(newTask)
                        }
                })
}

bulkCreateTasks('../../data/blind-75.csv');
