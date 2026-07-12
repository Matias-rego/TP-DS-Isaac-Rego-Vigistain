import express from 'express';
import userRoutes from '@/modules/users/user.routes.js';
import authRoutes from '@/modules/auths/auth.routes.js';
import failureTypeRoutes from '@/modules/failureTypes/failureType.routes.js';
import clientRoutes from '@/modules/clients/client.routes.js';
import paymentTypeRoutes from '@/modules/paymentTypes/paymentType.routes.js';
import failureRoutes from '@/modules/failureTypes/failureType.routes.js';
import clientTypeRoutes from '@/modules/clientTypes/clientCategory.routes.js';
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
export default router;