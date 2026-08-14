import { z } from "zod";
import { tipo_equipment, brand, model, observations, id } from "@/utils/fields.js";

export const registerEquipmentSchema = z.object({
    tipo_equipment: tipo_equipment,
    brand: brand,
    model: model,
    observations: observations.optional(),
    id_client: id,
}).strict();

export type RegisterEquipmentDto = z.infer<typeof registerEquipmentSchema>;
    
