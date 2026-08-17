import { z } from "zod";
import { id } from "@/utils/fields.js";

export const idSchema = z.object({
  id: id,
});

export type IdDto = z.infer<typeof idSchema>;