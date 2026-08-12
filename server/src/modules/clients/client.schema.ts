import { z } from "zod"
import { clientName, phone, email, cuit} from "@/utils/fields.js"

export const newClientSchema= z.object({
    clientName: clientName,
    clientEmail: email,
    clientPhone: phone,
    cuit: cuit

}).strict();

export type NewClientDto = z.infer<typeof newClientSchema>

export const modifyClientSchema = z.object({
    clientName: clientName.optional(),
    clientEmail: email.optional(),
    clientPhone: phone.optional(),
    cuit: cuit.optional()
}).strict();

export type ModifyClientDto = z.infer<typeof modifyClientSchema>