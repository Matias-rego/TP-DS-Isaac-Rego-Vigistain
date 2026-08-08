import { Router } from 'express';
import { registerUser, loginUser, forgotPassword, resetPassword, getMe, logout, validateAccountController} from "./auth.controller.js";
import authenticate from '@/middlewares/authenticate.middleware.js';
import { upload } from '@/middlewares/upload.middleware.js';
import { validate } from '@/middlewares/validation.middleware.js';
import { loginSchema } from './auth.schema.js';

const router = Router();

router.post('/register', upload.single('foto'), registerUser);

router.post('/login', validate(loginSchema), loginUser);

router.post('/logout', authenticate([]), logout);

router.post('/refresh', (req, res) => {
    res.status(200).json({ message: 'Refresh token endpoint not implemented yet' });
});

router.post('/forgot-password', forgotPassword);

router.post('/reset-password/:token', resetPassword);

router.put('/validate/:token', validateAccountController);

router.get('/me', authenticate([]), getMe);

export default router;