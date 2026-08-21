import { Router } from 'express';
import { validate } from '@/middlewares/validation.middleware.js';
import { equipmentQuerySchema, registerEquipmentSchema } from './equipment.schema.js';
import { EquipmentController } from './equipment.controller.js';
import { EquipmentService } from './equipment.service.js';
import { idSchema } from "@/shared/common.schema.js";
import { EquipmentRepository } from './equipment.repository.js';
import prisma from "@/database/prisma.js";

const ctrl = new EquipmentController(
    new EquipmentService(
        new EquipmentRepository(
            prisma
        )
    )
)

const router = Router();

router.get('/', validate({ query: equipmentQuerySchema}), ctrl.getAllEquipment)

router.post('/', validate({ body: registerEquipmentSchema }), ctrl.registerEquipment);

router.get('/:id', validate({ params: idSchema }), ctrl.getOneEquipment)

export default router;