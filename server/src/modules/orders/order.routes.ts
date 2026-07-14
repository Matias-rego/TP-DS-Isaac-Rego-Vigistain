import {Router} from 'express';
import { registerOrder } from '@/modules/orders/order.controller.js';

const router = Router();

router.post('/', registerOrder);

export default router;