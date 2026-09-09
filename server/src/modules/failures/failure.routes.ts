import { Router } from 'express'
import { createFailuresSchema } from './failure.schema.js';
import { validate } from '@/middlewares/validation.middleware.js';
import { idSchema } from '@/shared/common.schema.js';
import { FailureController } from './failure.controller.js';
import { FailureService } from './failure.service.js';
import { FailureRepository } from './failure.repository.js';
import prisma from '@/database/prisma.js';

const ctrl = new FailureController(
    new FailureService(
        new FailureRepository(
            prisma
        )))

const router = Router();

router.post("/", validate({ body: createFailuresSchema }), ctrl.createFailures);

router.get('/ofEquipment/:id', validate({ params: idSchema }), ctrl.getFailureOfEquipment);

export default router;