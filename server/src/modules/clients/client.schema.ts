import { z } from "zod";
import { name, phone, email, cuit } from "@/utils/fields.js";
import { QuerySchema } from "@/shared/common.schema.js";
import { enumSchema } from "@/utils/fields.js";

export const createClientSchema = z.object({
    clientName: name,
    clientEmail: email,
    clientPhone: phone,
    cuit: cuit,
}).strict();

export type CreateClientDto = z.infer<typeof createClientSchema>;

export const modifyClientSchema = z.object({
    clientName: name.optional(),
    clientEmail: email.optional(),
    clientPhone: phone.optional(),
    cuit: cuit.optional(),
    status: z.boolean().optional(),
}).strict();

export type ModifyClientDto = z.infer<typeof modifyClientSchema>;

// Reemplaza al viejo getPartialClient: "search" cubre nombre/email/cuit,
// y "categoryClient" filtra por el nombre del tipo de cliente asociado
// (lo que antes hacía el filtro `categoryClient` de req.query a mano).
export const clientQuerySchema = QuerySchema.extend({
    categoryClient: z.string().optional(),
    sortBy: enumSchema([
        "clientName",
        "clientEmail",
        "cuit",
        "dateOfRegistration",
    ], "sortBy").default("dateOfRegistration"),
});

export type ClientQueryDto = z.infer<typeof clientQuerySchema>;