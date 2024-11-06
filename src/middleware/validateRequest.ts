import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

export const validateRequest =
  (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (e: unknown) {
      if (e instanceof Error) {
        res.status(400).json({ error: e.message });
      } else {
        res.status(400).json({ error: "An unknown error occurred" });
      }
    }
  };
