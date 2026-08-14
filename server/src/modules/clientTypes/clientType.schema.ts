import { name, cant } from "@/utils/fields.js";
import { z } from "zod"

export const newClientTypeSchema = z.object({
  categoryClientName: name,
  amountForCategoryUp: cant
}).strict();

export type NewClientTypeDto = z.infer<typeof newClientTypeSchema>

export const modifyClientTypeSchema = z.object({
  categoryClientName: name.optional(),
  amountForCategoryUp: cant.optional()
});

export type ModifyClientTypeDto = z.infer<typeof modifyClientTypeSchema>
