import { Router } from 'express';
import { getUser, modifyUser, getAllUsers, createUser, deleteUser } from "./userController.js";
import { upload } from '../../middlewares/upload.middleware.js';

const router = Router();

router.get('/', getAllUsers)

router.post('/', createUser);

router.get('/:id', getUser)

router.put('/:id', upload.single('foto'), modifyUser);

router.patch('/:id', upload.single('foto'), modifyUser);

router.delete('/:id', deleteUser);

export default router;