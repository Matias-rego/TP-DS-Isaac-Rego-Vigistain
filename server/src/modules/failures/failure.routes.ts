import { Router } from 'express'
import { createFailures, getFailureOfEquipment } from './failure.controller.js';
import { createFailuresSchema } from './failure.schema.js';
import { validate } from '@/middlewares/validation.middleware.js';
import { idSchema } from '@/shared/common.schema.js';


const router = Router();

router.post("/", validate({ body: createFailuresSchema }), createFailures);

router.get('/ofEquipment/:id', validate({ params: idSchema }) , getFailureOfEquipment);

// router.post('/createTypeFail', createTypeFail);

// router.get('/getAllTypes', getAllTypes);

// router.delete('/deleteType/:id', deleteType);

// router.put('/modifyType/:id_failure_type', modifyType);

export default router;