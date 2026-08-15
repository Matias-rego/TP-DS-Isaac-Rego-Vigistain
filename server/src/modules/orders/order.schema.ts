import { int, z } from "zod";
import { id, observations, url, date, } from "@/utils/fields.js";

export const registerOrderSchema = z.object({
    id_equipment: id,
    observations: observations.optional(),
    equipmentPhotoUrl: url.optional(),
    estimatedDate: date.optional(),
    id_user: id,
}).strict();

export type RegisterOrderDto = z.infer<typeof registerOrderSchema>;