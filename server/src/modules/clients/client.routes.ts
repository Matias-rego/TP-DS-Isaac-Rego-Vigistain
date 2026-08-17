import { Router } from "express";
import { createNewClient, getAllClients, getOneClient, modifyClient, getPartialClient } from "./client.controller.js";
import { validate } from "@/middlewares/validation.middleware.js";
import { createClientSchema, modifyClientSchema } from "./client.schema.js";
import { idSchema } from "@/shared/common.schema.js";

const router = Router();

router.post('/', validate({ body: createClientSchema }), createNewClient);

router.get('/', getAllClients);

router.get('/search', getPartialClient);

router.get('/:id', validate({params: idSchema}), getOneClient);

router.put('/:id', validate({ params: idSchema, body: modifyClientSchema }), modifyClient);



export default router;