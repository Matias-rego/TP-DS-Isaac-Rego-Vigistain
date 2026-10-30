import type { Request, Response } from 'express';
import { $Enums } from "@/database/prisma.js";
import type { IdDto } from "@/shared/common.schema.js";
import type { RegisterOrderDto, OrderQueryDto } from './order.schema.js';
import type { OrderService } from './order.service.js';

export class OrderController {
  constructor(private service: OrderService) {}

  public registerOrder = async (
    req: Request,
    res: Response,
  ) => {
    const data = req.validated.body as RegisterOrderDto;

    const newOrder = await this.service.create({
      ...data,
      status: $Enums.EnumOrderStatus.recibido,
      dateOfEntry: new Date(),
      estimatedDate: data.estimatedDate
        ? new Date(data.estimatedDate)
        : undefined,
      equipmentPhotoUrl: data.equipmentPhotoUrl ?? undefined,
    });
    return res.status(201).json({
      message: 'Orden registrada con éxito',
      order: newOrder,
    });
  };

  public getOneOrder = async (
    req: Request,
    res: Response,
  ) => {
    const { id } = req.validated.params as IdDto;

    res.json(await this.service.findById(id));
  };

  // Cubre tanto el listado general como la búsqueda parcial: OrderQueryDto
  // trae "search" y el repository lo aplica con `contains` sobre
  // observations. No hace falta un endpoint /search aparte (mismo criterio
  // que se usó en equipment.controller.ts).
  public getAllOrders = async (
    req: Request,
    res: Response,
  ) => {
    const query = req.validated.query as OrderQueryDto;

    res.json(await this.service.findAll(query));
  };

  public getOrderOfEquipment = async (
    req: Request,
    res: Response,
  ) => {
    const { id } = req.validated.params as IdDto;

    const orders = await this.service.findByEquipmentId(id);
    return res.status(200).json(orders);
  };

  // Métricas para las tarjetas del Home: cuenta órdenes por estado.
  // Delega en el service -> repository (misma arquitectura de capas que
  // el resto del módulo), en vez de pegarle a prisma desde el controller.
  public getStats = async (
    _req: Request,
    res: Response,
  ) => {
    res.status(200).json(await this.service.getStats());
  };

  public deleteOrder = async (
    req: Request,
    res: Response,
  ) => {
    const { id } = req.validated.params as IdDto;

    const result = await this.service.delete(id);
    return res.status(200).json({
      message: 'Orden dada de baja con éxito',
      ...result,
    });
  };
}
