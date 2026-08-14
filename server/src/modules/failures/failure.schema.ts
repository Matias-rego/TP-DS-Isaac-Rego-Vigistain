import { z } from "zod";
import { id, description } from "@/utils/fields.js";

export const createFailuresSchema = z.array(
    z.object({
        id_failure_type: id,
        failureDescription: description,
        id_equipment: id,
      }).strict(),
    {
      error: (issue) => {
        if (issue.code === "invalid_type") {
          return "The body must be an array of failures";
        }

        return "Invalid failures body format";
      },
    }
  )
  .min(1, {
    error: "At least one failure is required",
  });

export type CreateFailuresDto = z.infer<typeof createFailuresSchema>;