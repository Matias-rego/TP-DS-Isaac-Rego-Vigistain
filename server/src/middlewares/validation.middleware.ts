import type { Request, Response, NextFunction } from "express";
import type { ZodType } from "zod";
import { z } from "zod";
import { ValidationError } from "@/shared/http-errors.js";

type ReqPart = "body" | "query" | "params";
type ValidationSchemas = Partial<Record<ReqPart, ZodType>>;

export function validate(schemas: ValidationSchemas) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const errors: Record<string, unknown> = {};
    const validated: Record<string, unknown> = {};

    for (const [part, schema] of Object.entries(schemas)) {
      const result = schema.safeParse(req[part as ReqPart]);

      if (!result.success) {
        errors[part] = z.flattenError(result.error).fieldErrors;
        continue;
      }
      validated[part] = result.data;
    }

    if (Object.keys(errors).length > 0) {
      return next(new ValidationError(errors));
    }

    req.validated = validated;
    next();
  };
}