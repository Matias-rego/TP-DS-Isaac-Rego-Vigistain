import { Router } from 'express'
import { createFailures } from './failureController.js';


const router = Router();

router.post("/", createFailures);

// router.post('/createTypeFail', createTypeFail);

// router.get('/getAllTypes', getAllTypes);

// router.delete('/deleteType/:id', deleteType);

// router.put('/modifyType/:id_failure_type', modifyType);

export default router;