import { Router } from "express";
import { createTypePayment, deleteTypePayment, getAllPaymentTypes, getPartialTypesPayment, modifyTypePayment } from "./paymentType.controller.js";
import { createTypePaymentSchema, modifyTypePaymentSchema } from "./paymentType.schema.js";
import { validate } from "@/middlewares/validation.middleware.js";
import { idSchema } from "@/shared/common.schema.js";

const route = Router();

route.get('/', getAllPaymentTypes);

route.post('/', validate({ body: createTypePaymentSchema }), createTypePayment);

route.get('/:query', getPartialTypesPayment);

route.delete('/:id', validate({ params: idSchema }), deleteTypePayment);

route.put('/:id', 
    validate({ params: idSchema, body: modifyTypePaymentSchema }),
     modifyTypePayment);

export default route;
