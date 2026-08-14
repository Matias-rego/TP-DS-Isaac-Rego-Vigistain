import { Router } from 'express';
import { getUser, modifyUser, getAllUsers, createUser, deleteUser, getPartialUser } from "./user.controller.js";
import { upload } from '../../middlewares/upload.middleware.js';
import { validate } from '@/middlewares/validation.middleware.js';
import { idSchema } from '@/shared/common.schema.js';
import { modifyUserSchema } from './user.schema.js';

const router = Router();

router.get('/', getAllUsers)

router.post('/', createUser);

router.get('/search', getPartialUser);

router.get('/:id', validate({ params: idSchema }), getUser);

router.put('/:id', 
    upload.single('foto'), 
    validate({ params: idSchema, body: modifyUserSchema }), 
    modifyUser);

router.patch('/:id', 
    upload.single('foto'), 
    validate({ params: idSchema, body: modifyUserSchema }),
    modifyUser);

router.delete('/:id',validate({ params: idSchema }), deleteUser);

export default router;