import { z } from "zod";
import { name, paymentMethod, typeOfPayment, percentaje} from "@/utils/fields.js";

export const createTypePaymentSchema = z.object({
    paymentTypeName: name,
    paymentMethod: paymentMethod,
    type_of_payment: typeOfPayment,
    percentaje: percentaje
}).strict();

export type CreateTypePaymentDto = z.infer<typeof createTypePaymentSchema>;

export const modifyTypePaymentSchema = z.object({
    paymentTypeName: name.optional(),
    paymentMethod: paymentMethod.optional(),
    type_of_payment: typeOfPayment.optional(),
    percentaje: percentaje.optional()
});

export type ModifyTypePaymentDto = z.infer<typeof modifyTypePaymentSchema>; 
