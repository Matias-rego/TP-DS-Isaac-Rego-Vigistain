import type { Request, Response } from 'express';
import prisma, { $Enums } from "@/database/prisma.js";
import { createFirstStatus } from '../status/status.controller.js';
import type { RegisterOrderDto } from './order.schema.js';
import { EnumBudgetStatus, EnumOrderStatus, Prisma } from '@/generated/prisma/client.js';

export const getOrders = async (req: Request, res: Response) => {
  try {
    const order = await prisma.order.findMany({
      include: {
        equipment: {
          include: {
            client: true,
            failures: { include: { failureType: true } }, 
          },
        },
        statusHistory: {
          include: { user: true },
          orderBy: { dateOfChange: 'desc' },
        },
        user: true,
      },
    });

    if (order.length <= 0) {
      return res.status(404).json({ message: "No se encuentran órdenes cargadas" });
    }

    res.status(200).json(order);
  } catch (e) {
    console.error("Error en el getOrders", e);
    res.status(500).json({ message: "Error del server", error: e });
  }
};

export const registerOrder = async (req: Request, res: Response) => {
  try {
    const { id_equipment, observations, equipmentPhotoUrl, estimatedDate, id_user }: RegisterOrderDto = req.body;

    const response = await prisma.order.create({
      data: {
        id_equipment,
        observations: observations ?? null,
        equipmentPhotoUrl: equipmentPhotoUrl ?? null,
        estimatedDate: estimatedDate ? new Date(estimatedDate) : null,
        id_user: id_user
      },
    });
    if(response){
      createFirstStatus(id_user, response.id_order);
      return res.status(201).json({
        message: "Orden registrada con éxito",
        order: response,
      });
    }
  } catch (error) {
    console.error("Error :", error);
    return res.status(500).json({
      message: "Error al registrar la orden",
    });
  }
};

export const getOrderOfEquipment = async (req:Request, res:Response) => {
  try{
    const id_equipment = Number(req.params.id);
    if(isNaN(id_equipment)){
      return res.status(400).json({ message: "El ID de equipo no es válido" });
    };
    const orders = await prisma.order.findMany({
      where:{
        id_equipment : id_equipment,
      },
      include:{
        statusHistory: true,
        
      }
    });
    return res.status(200).json(orders);
  }catch(e){
    console.error("Error : ", e);
    res.status(500).json({message:"Error en el getOrderOfEquipment"})
  }
};

export const getPartialOrder = async (req: Request, res: Response) => {
  try {
    const { q, status, dateOfEntry } = req.query as { q?: string; status?: string; dateOfEntry?: string };

    const filters: Prisma.OrderWhereInput[] = [];

    // 1. Filtro Búsqueda Texto / ID
    if (q && q.trim()) {
      const search = q.trim();
      const asNumber = Number(search);
      const isNumeric = !isNaN(asNumber) && Number.isInteger(asNumber);

      filters.push({
        OR: [
          ...(isNumeric ? [{ id_order: asNumber }] : []),
          { equipment: { client: { clientName: { contains: search } } } },
          { equipment: { brand: { contains: search } } },
          { equipment: { model: { contains: search } } },
        ],
      });
    }

    // 2. Filtro Estado (Filtra de forma directa y exacta sobre el estado actual)
    if (status) {
      filters.push({
        currentStatus: status as $Enums.EnumOrderStatus,
      });
    }

    // 3. Filtro Fecha (Rango diario en UTC)
    if (dateOfEntry) {
      const [year, month, day] = dateOfEntry.split('-').map(Number);
      if (year && month && day) {
        const dayStart = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
        const dayEnd = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));

        filters.push({
          dateOfEntry: {
            gte: dayStart,
            lte: dayEnd,
          },
        });
      }
    }

    // Consulta con filtros aplicados en el WHERE
    const orders = await prisma.order.findMany({
      where: filters.length > 0 ? { AND: filters } : {},
      include: {
        equipment: {
          include: {
            client: true,
            failures: { include: { failureType: true } }, 
          },
        },
        statusHistory: {
          include: { user: true },
          orderBy: { dateOfChange: 'desc' },
        },
        user: true,
      },
      orderBy: { id_order: 'desc' },
    });

    res.status(200).json(orders);
  } catch (e) {
    console.error("Error fetching partial order:", e);
    res.status(500).json({ error: "Error en el getPartialOrder" });
  }
};

export const updateOrderCurrentStatus = async (id_order:number, status: EnumOrderStatus) => {
    return await prisma.order.update({
      where: { id_order },
      data: { currentStatus: status },
    });
};