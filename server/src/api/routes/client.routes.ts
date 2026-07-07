import { Router } from "express";
import { createCategoryClient, deleteCategoryClient, getAllCategoryClients, getPartialCategoryClients, modifyCategoryClient} from "./../../controllers/categoryClientController.js"
import { createNewClient, getAllClients, getOneClient, modifyClient, getPartialClient} from "../../controllers/clientController.js";

const router = Router();

router.post('/createCategoryClient', createCategoryClient);

router.get('/getAllCategoryClients', getAllCategoryClients);

router.get('/getPartialCategoryClients/:description', getPartialCategoryClients);

router.delete('/deleteCategoryClient/:id', deleteCategoryClient);

router.put('/modifyCategoryClient/:id', modifyCategoryClient);

router.post('/createNewClient', createNewClient);

router.get('/getAllClients', getAllClients);

router.get('/getOneClient/:id', getOneClient);

router.post('/modifyClient/:id_client', modifyClient);

router.get('/getPartialClient', getPartialClient);

export default router;