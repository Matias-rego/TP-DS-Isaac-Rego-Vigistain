import {Router} from 'express';
import { registerOrder , getOrderOfEquipment} from '@/modules/orders/order.controller.js';

const router = Router();

router.get('/ofEquipment/:id', getOrderOfEquipment);

router.post('/', registerOrder);

export default router;