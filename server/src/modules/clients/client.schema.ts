import { z } from "zod"
import { name, phone, email, cuit} from "@/utils/fields.js"

export const createClientSchema= z.object({
    clientName: name,
    clientEmail: email,
    clientPhone: phone,
    cuit: cuit

}).strict();

export type CreateClientDto = z.infer<typeof createClientSchema>

export const modifyClientSchema = z.object({
    clientName: name.optional(),
    clientEmail: email.optional(),
    clientPhone: phone.optional(),
    cuit: cuit.optional()
});

export type ModifyClientDto = z.infer<typeof modifyClientSchema>