import { Router } from "express";
import { createNewClient, getAllClients, getOneClient, modifyClient, getPartialClient } from "./clientController.js";

const router = Router();

router.post('/createNewClient', createNewClient);

router.get('/getAllClients', getAllClients);

router.get('/getOneClient/:id', getOneClient);

router.post('/modifyClient/:id_client', modifyClient);

router.get('/getPartialClient', getPartialClient);

export default router;