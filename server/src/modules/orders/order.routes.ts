import {Router} from 'express';
import { registerOrder , getOrderOfEquipment, getOrders, getPartialOrder} from '@/modules/orders/order.controller.js';
import { validate } from '@/middlewares/validation.middleware.js';
import { idSchema } from '@/shared/common.schema.js';
import { registerOrderSchema } from './order.schema.js';
import type { OrderController } from "./order.controller.js";
import type { OrderService } from "./order.service.js";
import type { OrderRepository } from "./order.repository.js";

const ctrl = new OrderController(
    new OrderService(
        new OrderRepository(
            prisma
        )))


const router = Router();

router.get('/', getOrders);

router.get('/search', getPartialOrder);

router.get('/ofEquipment/:id', validate({params: idSchema}), getOrderOfEquipment);

router.post('/', validate({ body: registerOrderSchema }), ctrl.registerOrder);

export default router;
