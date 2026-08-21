import { Router } from 'express';
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

router.get('/ofEquipment/:id', validate({ params: idSchema }), ctrl.getOrderOfEquipment);

router.post('/', validate({ body: registerOrderSchema }), ctrl.registerOrder);

export default router;