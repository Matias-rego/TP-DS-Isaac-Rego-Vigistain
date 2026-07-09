import { Router } from 'express';
import { getUser, modifyUser } from "./userController.js";
import { upload } from '../../middlewares/upload.middleware.js';
import { forgotPassword, resetPassword } from '@/modules/auths/passwordController.js';


const router = Router();

router.get('/verifica/:id_user', getUser)

router.put('/update/:id_user', upload.single('foto'), modifyUser);

router.post('/forgot-password', forgotPassword);

router.post('/reset-password/:token', resetPassword);




export default router;