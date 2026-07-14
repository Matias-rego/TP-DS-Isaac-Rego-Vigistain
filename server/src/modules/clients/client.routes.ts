import { Router } from "express";
import { createNewClient, getAllClients, getOneClient, modifyClient, getPartialClient } from "./clientController.js";

const router = Router();

router.post('/', createNewClient);

router.get('/', getAllClients);

router.get('/search', getPartialClient);

router.get('/:id', getOneClient);

router.put('/:id', modifyClient);



export default router;