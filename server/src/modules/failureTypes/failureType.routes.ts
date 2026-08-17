import { Router } from "express";
import { getPartialTypes, createTypeFail, getAllTypes, deleteType, modifyType } from './failureType.controller.js'
import { idSchema } from "@/shared/common.schema.js";
import { validate } from "@/middlewares/validation.middleware.js";
import { registerFailureTypeSchema } from "./failureType.schema.js";

const router = Router();

router.get('/', getAllTypes);

router.get('/:query', getPartialTypes);

router.post('/',validate({body: registerFailureTypeSchema}), createTypeFail);

router.delete('/:id',validate({params: idSchema}), deleteType);

router.put('/:id_failure_type', validate({params: idSchema}), modifyType);

export default router;
