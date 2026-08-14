import type { Request, Response } from 'express';
import prisma from "@/database/prisma.js";
import type { RegisterOrderDto } from './order.schema.js';

export const registerOrder = async (req: Request, res: Response) => {
  try {
    const { id_equipment, observations, equipmentPhotoUrl, estimatedDate }: RegisterOrderDto = req.body;

    const response = await prisma.order.create({
      data: {
        id_equipment,
        observations: observations ?? null,
        equipmentPhotoUrl: equipmentPhotoUrl ?? null,
        estimatedDate: estimatedDate ? new Date(estimatedDate) : null,
      },
    });
    return res.status(201).json({
      message: "Orden registrada con éxito",
      order: response,
    });
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
      }
    });
    return res.status(200).json(orders);
  }catch(e){
    console.error("Error : ", e);
    res.status(500).json({message:"Error en el getOrderOfEquipment"})
  }
}