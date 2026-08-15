import { Router } from 'express';
import {upload} from '@/middlewares/upload.middleware.js';
import { uploadPhotoCloud, registerEquipment, getPartialEquipment} from './equipment.controller.js';
import { validate } from '@/middlewares/validation.middleware.js';
import { registerEquipmentSchema } from './equipment.schema.js';

const router =Router();

router.get('/search', getPartialEquipment)

router.post('/upload-photo', upload.single('foto'), uploadPhotoCloud);

router.post('/', validate({body: registerEquipmentSchema}), registerEquipment);

export default router;