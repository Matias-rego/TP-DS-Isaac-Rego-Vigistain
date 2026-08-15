import {Router} from 'express';
import { registerOrder , getOrderOfEquipment} from '@/modules/orders/order.controller.js';
import { validate } from '@/middlewares/validation.middleware.js';
import { idSchema } from '@/shared/common.schema.js';
import { registerOrderSchema } from './order.schema.js';

const router = Router();

router.get('/ofEquipment/:id', validate({params: idSchema}), getOrderOfEquipment);

router.post('/', validate({body: registerOrderSchema}), registerOrder);

export default router;