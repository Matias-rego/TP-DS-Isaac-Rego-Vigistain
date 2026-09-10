import { Router } from 'express'
import { createFailuresSchema, modifyFailureSchema } from './failure.schema.js';
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

router.get('/ofOrder/:id', validate({ params: idSchema }), ctrl.getFailuresOfOrder);

router.put('/:id', validate({params: idSchema,body: modifyFailureSchema}), ctrl.modifyFailure);

router.delete('/:id', validate({params: idSchema}), ctrl.deleteFailure)

export default router;