import { Request, Response } from "express";
import { ProjectService } from "../services/projectService";

export class ProjectController {
  static async indexProjects(req: Request, res: Response) {
    res.json({ message: "index projects" });
  }

  static async showProjectUsers(req: Request, res: Response) {
    const projectUsers = await ProjectService.showProjectUsers(req.params.id);
    res.json({ projectUsers });
  }
}
