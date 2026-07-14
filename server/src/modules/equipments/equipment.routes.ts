import { Router } from 'express';
import {upload} from '@/middlewares/upload.middleware.js';
import { uploadPhotoCloud, registerEquipment } from './equipment.controller.js';

const router =Router();

router.post('/upload-photo', upload.single('foto'), uploadPhotoCloud);

router.post('/', registerEquipment);

export default router;