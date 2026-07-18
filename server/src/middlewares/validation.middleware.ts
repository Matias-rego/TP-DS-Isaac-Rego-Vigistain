// middlewares/validate.ts
import { Request, Response, NextFunction } from "express";
import { ZodType, z } from "zod";

type ReqPart = "body" | "query" | "params";

export function validate(schema: ZodType, part: ReqPart = "body") {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[part]);

    if (!result.success) {
      const errorTree = z.treeifyError(result.error);

      return res.status(400).json({
        message: "Validation failed",
        errors: errorTree,
      });
    }

    req[part] = result.data;
    next();
  };
}