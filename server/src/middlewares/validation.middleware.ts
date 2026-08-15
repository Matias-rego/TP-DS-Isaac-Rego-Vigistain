import type { Request, Response, NextFunction } from "express";
import type { ZodType } from "zod";
import { z } from "zod";

type ReqPart = "body" | "query" | "params";

type ValidationSchemas = Partial<
  Record<ReqPart, ZodType>
>;

export function validate(schemas: ValidationSchemas) {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: Record<string, unknown> = {};

    for (const [part, schema] of Object.entries(schemas)) {
      const result = schema.safeParse(req[part as ReqPart]);

      if (!result.success) {
        errors[part] = z.treeifyError(result.error);
        continue;
      }

      req[part as ReqPart] = result.data;
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        message: "Validation failed",
        errors,
      });
    }

    next();
  };
}