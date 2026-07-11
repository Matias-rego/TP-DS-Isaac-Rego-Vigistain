import { Router } from "express";
import { getPartialTypes, createTypeFail, getAllTypes, deleteType, modifyType } from './failureTypeController.js'

const router = Router();

router.get('/', getAllTypes);

router.get('/:query', getPartialTypes);

router.post('/', createTypeFail);

router.delete('/:id', deleteType);

router.put('/:id_failure_type', modifyType);

export default router;
