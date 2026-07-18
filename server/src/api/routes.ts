import express from 'express';
import userRoutes from '@/modules/users/user.routes.js';
import authRoutes from '@/modules/auths/auth.routes.js';
import failureTypeRoutes from '@/modules/failureTypes/failureType.routes.js';
import clientRoutes from '@/modules/clients/client.routes.js';
import paymentTypeRoutes from '@/modules/paymentTypes/paymentType.routes.js';
import failureRoutes from '@/modules/failures/failure.routes.js';
import clientTypeRoutes from '@/modules/clientTypes/clientCategory.routes.js';
import equipmentRoutes from '@/modules/equipments/equipment.routes.js';
import orderRouter from '@/modules/orders/order.routes.js';
import { authenticate } from '@/middlewares/authenticate.middleware.js';

const router = express.Router();

router.get('/status', (_req: express.Request, res: express.Response) =>
    res.send('ok'));
router.use('/auth', authRoutes);
router.use('/users', authenticate([]), userRoutes);
router.use('/clients', authenticate([]), clientRoutes);
router.use('/failures', authenticate([]), failureRoutes);
router.use('/client-types', authenticate([]), clientTypeRoutes);
router.use('/failure-types', authenticate([]), failureTypeRoutes);
router.use('/payment-types', authenticate([]), paymentTypeRoutes);
router.use('/equipments', authenticate([]), equipmentRoutes);
router.use('/orders', authenticate([]), orderRouter);

export default router;