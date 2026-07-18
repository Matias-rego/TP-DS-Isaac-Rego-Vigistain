import { Router } from "express";
import { createTypePayment, deleteTypePayment, getAllPaymentTypes, getPartialTypesPayment, modifyTypePayment } from "./paymentTypeControllers.js";


const route = Router();

route.get('/', getAllPaymentTypes);

route.post('/', createTypePayment);

route.get('/:query', getPartialTypesPayment);

route.delete('/:id', deleteTypePayment);

route.put('/:id', modifyTypePayment);

export default route;
