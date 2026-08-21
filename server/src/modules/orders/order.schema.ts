import { id, observations, url, date, enumSchema } from "@/utils/fields.js";
import { QuerySchema } from "@/shared/common.schema.js";
import { z } from "zod";

export const registerOrderSchema = z.object({
    id_equipment: id,
    observations: observations.optional(),
    equipmentPhotoUrl: url.optional(),
    estimatedDate: date.optional(),
}).strict();

export type RegisterOrderDto = z.infer<typeof registerOrderSchema>;

export const orderQuerySchema = QuerySchema.extend({
    sortBy: enumSchema([
        "dateOfEntry",
        "estimatedDate",
        "deliveryDate",
        "totalCharged",
        "observations",
        "id_equipment",
    ], "sortBy").default("dateOfEntry"),
});

export type OrderQueryDto = z.infer<typeof orderQuerySchema>