import { Router } from 'express';
import prisma from '@/database/prisma.js';
import { validate } from '@/middlewares/validation.middleware.js';
import { idSchema } from '@/shared/common.schema.js';
import { registerOrderSchema, orderQuerySchema } from './order.schema.js';
import { OrderController } from './order.controller.js';
import { OrderService } from './order.service.js';
import { OrderRepository } from './order.repository.js';
import { StatusService } from '@/modules/status/status.service.js';
import { StatusHistoryRepository } from '@/modules/status/status.repository.js';

const orderRepo = new OrderRepository(prisma);
const statusRepo = new StatusHistoryRepository(prisma);
const statusService = new StatusService(statusRepo, orderRepo);

const ctrl = new OrderController(
  new OrderService(orderRepo, statusService)
);

const router = Router();

router.get('/', validate({ query: orderQuerySchema }), ctrl.getAllOrders);

router.get('/ofEquipment/:id', validate({ params: idSchema }), ctrl.getOrderOfEquipment);

router.get('/:id', validate({ params: idSchema }), ctrl.getOneOrder);

router.post('/', validate({ body: registerOrderSchema }), ctrl.registerOrder);

export default router;