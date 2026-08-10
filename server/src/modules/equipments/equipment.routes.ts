import { Router } from 'express';
import {upload} from '@/middlewares/upload.middleware.js';
import { uploadPhotoCloud, registerEquipment, getPartialEquipment} from './equipment.controller.js';

const router =Router();

router.get('/search', getPartialEquipment)

router.post('/upload-photo', upload.single('foto'), uploadPhotoCloud);

router.post('/', registerEquipment);



export default router;