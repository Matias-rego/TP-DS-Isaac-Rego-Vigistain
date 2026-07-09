import express from 'express';
import userRoutes from '@/modules/users/user.routes.js';
import authRoutes from '@/modules/auths/auth.routes.js';
import failRoutes from '@/modules/failures/failure.routes.js'
import clientRoutes from '@/modules/clients/client.routes.js'
import paymentsRoutes from '@/modules/payments/payment.routes.js';
import failureRoutes from '@/modules/failureTypes/failureType.routes.js'
import categoryRoutes from '@/modules/clientCategories/clientCategory.routes.js'
const router = express.Router();

router.get('/status', (_req, res) => {
    res.send('ok');
});
router.use('/users', userRoutes);
router.use('/auth', authRoutes);
router.use('/failures', failRoutes)
router.use('/clients', clientRoutes);
router.use('/payments', paymentsRoutes);
router.use('/failureType', failureRoutes);
router.use('/clientCategories', categoryRoutes);

// Exportación moderna
export default router;