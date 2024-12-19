import csv from "csv-parser";
import fs from "fs";
import path from "path";
import { TodoistService } from "../services/todoistService";

export const bulkCreateTasks = (input: string) => {
        const results: any[] = []
        const filePath = path.resolve(__dirname, input);

        fs.createReadStream(filePath)
                .pipe(csv(['Type', 'Difficulty', 'Name', 'Link']))
                .on('data', (data) => results.push(data))
                .on('end', async () => {
                        for (const task of results) {
                                const newTask = await TodoistService.addItem({
                                        content: task.Name,
                                        project_id: process.env.TODOIST_LEETCODE_PROJECT_ID!,
                                        section_id: "176825721",
                                        labels: [task.Difficulty, task.Type],
                                        description: task.Link, // add link to problem as the description
                                })
                                console.log(newTask)
                                await new Promise(r => setTimeout(r, 2000));
                        }
                })
}

bulkCreateTasks('../../data/blind-75.csv');
