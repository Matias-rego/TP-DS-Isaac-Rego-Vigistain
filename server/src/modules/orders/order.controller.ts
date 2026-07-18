import { Request, Response } from 'express';
import prisma from "@/database/prisma.js";

export const registerOrder = async (req: Request, res: Response) => {
  try {
    const { id_equipment, observations, equipmentPhotoUrl, estimatedDate } = req.body;
    if (!id_equipment) {
      return res.status(400).json({
        message: "Falta id_equipment para registrar la orden",
      });
    }
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