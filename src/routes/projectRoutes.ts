import { Router } from "express";
import { ProjectController } from "../controllers/projectController";

const router: Router = Router();

router.get("/", async (req, res) => {
  await ProjectController.indexProjects(req, res);
});

router.get("/:id/users", async (req, res) => {
  await ProjectController.showProjectUsers(req, res);
});

export default router;
