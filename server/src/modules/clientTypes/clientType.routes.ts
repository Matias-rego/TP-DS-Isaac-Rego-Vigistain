import { Router } from "express";
import { newClientType, deleteClientType, getAllClientTypes, getPartialClientTypes, modifyClientType } from "./clientType.controller.js"
import { validate } from "@/middlewares/validation.middleware.js";
import { modifyClientTypeSchema, newClientTypeSchema } from "./clientType.schema.js";
import { idSchema } from "@/shared/common.schema.js";

const router = Router()

router.post('/', validate({ body: newClientTypeSchema }), newClientType);

router.get('/', getAllClientTypes);

router.get('/:description', getPartialClientTypes);

router.delete('/:id', 
    validate({ params: idSchema }),
    deleteClientType);

router.put('/:id', 
    validate({ params: idSchema, body: modifyClientTypeSchema }),
    modifyClientType);

export default router;


