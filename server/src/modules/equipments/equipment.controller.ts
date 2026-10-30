import type { Request, Response } from 'express';
import type { RegisterEquipmentDto, EquipmentQueryDto, ModifyEquipmentDto } from './equipment.schema.js';
import type { IdDto } from "@/shared/common.schema.js";
import type { EquipmentService } from './equipment.service.js';
import { NotFoundError } from "@/shared/http-errors.js";

export class EquipmentController {
  constructor(private service: EquipmentService) { }

  public registerEquipment = async (req: Request, res: Response) => {
    const data = req.validated.body as RegisterEquipmentDto;

    const newEquipment = await this.service.create(data);
    return res.status(201).json(newEquipment);
  };

  public getOneEquipment = async (req: Request, res: Response) => {
    const { id } = req.validated.params as IdDto;

    res.json(await this.service.findById(id));
  };

  // getAllEquipment ya cubre la búsqueda parcial: EquipmentQueryDto trae
  // "search" y el repository lo aplica con `contains` sobre brand/model/
  // observations. No hace falta un endpoint aparte para eso.
  public getAllEquipment = async (req: Request, res: Response) => {
    const query = req.validated.query as EquipmentQueryDto;

    res.json(await this.service.findAll(query));
  };

  // NOTA: requiere que EquipmentService tenga un método findByClientId
  // (ver snippet aparte para el repository y el service).
  public getEquipmentOfClient = async (req: Request, res: Response) => {
    const { id } = req.validated.params as IdDto;

    const equipments = await this.service.findByClientId(id);
    return res.status(200).json(equipments);
  };

  public modifyEquipment = async (req: Request, res: Response) => {
    const { id } = req.validated.params as IdDto;
    const data = req.validated.body as ModifyEquipmentDto;

    const updated = await this.service.update(id, data);

    if (!updated) {
      throw new NotFoundError("Equipo no encontrado");
    }

    return res.json(updated);
  };

  public deleteEquipment = async (req: Request, res: Response) => {
    const { id } = req.validated.params as IdDto;

    const deleted = await this.service.delete(id);

    if (!deleted) {
      throw new NotFoundError("Equipo no encontrado");
    }

    return res.status(200).json(deleted);
  };
}