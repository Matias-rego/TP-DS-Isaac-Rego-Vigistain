import { Router } from "express";
import { createCategoryClient, deleteCategoryClient, getAllCategoryClients, getPartialCategoryClients, modifyCategoryClient } from "./clientCategoryController.js"

const router = Router()

router.post('/', createCategoryClient);

router.get('/', getAllCategoryClients);

router.get('/:description', getPartialCategoryClients);

router.delete('/:id', deleteCategoryClient);

router.put('/:id', modifyCategoryClient);

export default router;