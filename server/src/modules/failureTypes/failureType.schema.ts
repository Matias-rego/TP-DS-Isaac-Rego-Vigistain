import { z } from "zod";
import { description, price} from "@/utils/fields.js";

export const registerFailureTypeSchema = z.object({
    failureDescription: description,
    estimatedImport: price,
}).strict();

export type RegisterFailureTypeDto = z.infer<typeof registerFailureTypeSchema>;

export const modifyFailureTypeSchema = z.object({
    failureDescription: description.optional(),
    estimatedImport: price.optional(),
}).strict();

export type ModifyFailureTypeDto = z.infer<typeof modifyFailureTypeSchema>;