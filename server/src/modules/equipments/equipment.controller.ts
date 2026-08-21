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
};