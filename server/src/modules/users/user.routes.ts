import { modifyUserSchema, userQuerySchema } from './user.schema.js';
import { UserController } from "./user.controller.js";
import { UserRepository } from "./user.repository.js";
import { UserService } from "./user.service.js";
import { idSchema } from '@/shared/common.schema.js';
import { validate } from '@/middlewares/validation.middleware.js';
import { upload } from '@/middlewares/upload.middleware.js';
import { Router } from 'express';
import prisma from '@/database/prisma.js';

const ctrl = new UserController(
    new UserService(
        new UserRepository(
            prisma
        )))

const router = Router();

router.get('/', validate({query: userQuerySchema}),ctrl.getAllUsers)

router.post('/', ctrl.createUser);

router.get('/:id', validate({ params: idSchema }), ctrl.getOneUser);

// upload.single('foto') va ANTES de validate: multer parsea el multipart,
// deja los campos de texto (userName, email) en req.body para que validate
// los revise, y sube la imagen a Cloudinary dejando la URL en req.file.path.
router.put('/:id', upload.single('foto'), validate({ params: idSchema, body: modifyUserSchema }), ctrl.modifyUser);

router.patch('/:id', upload.single('foto'), validate({ params: idSchema, body: modifyUserSchema }), ctrl.modifyUser);

router.delete('/:id', validate({ params: idSchema }), ctrl.deleteUser);

export default router;