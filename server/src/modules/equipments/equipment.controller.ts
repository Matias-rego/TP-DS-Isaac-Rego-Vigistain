import type { NextFunction, Request, Response } from 'express';
import type { RegisterEquipmentDto, EquipmentQueryDto } from './equipment.schema.js';
import type { IdDto } from "@/shared/common.schema.js";
import type { EquipmentService } from './equipment.service.js';

export class EquipmentController {
  constructor(private service: EquipmentService) { }

  public registerEquipment = async (req: Request, res: Response, next: NextFunction) => {
    const data = req.validated.body as RegisterEquipmentDto;

    try {
      const newEquipment = await this.service.create(data);
      return res.status(201).json(newEquipment)

    } catch (error) {
      next(error)
    }
  }

  public getOneEquipment = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.validated.params as IdDto;

    try {
      res.json(await this.service.findById(id));
    } catch (error) {
      next(error)
    }
  };

  public getAllEquipment = async (req: Request, res: Response, next: NextFunction) => {
    const query = req.validated.query as EquipmentQueryDto;

    try {
      res.json(await this.service.findAll(query));
    } catch (error) {
      next(error)
    }
  };
    return res.status(200).json(equipments);
  } catch (e) {
    console.error("Error en la busqueda parcial de equipos server: ", e);
    return res.status(500).json({ error: "Error en el getPartialEquipment" });
  }
};

export const getEquipmentOfClient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; 
    const clientId = Number(id);

    if (isNaN(clientId)) {
      return res.status(400).json({ message: "ID de cliente inválido" });
    }

    const response = await prisma.equipment.findMany({
      where: {
        id_client: clientId,
      },
    });

    return res.status(200).json(response);
  } catch (e) {
    console.error("Hay un error en server", e);
    return res.status(500).json({ error: "Error interno del servidor", details: e });
  }
};