import type { Request, Response } from "express";
import prisma from "@/database/prisma.js"; 
import type { CreateFailuresDto } from "./failure.schema.js";

export const createFailures = async (req: Request, res: Response) => {
  const failures: CreateFailuresDto = req.body;

  try {
    const resultado = await prisma.failure.createMany({
      data: failures.map((f) => ({
        id_failure_type: f.id_failure_type,
        id_equipment: f.id_equipment,
        description: f.failureDescription,
      })),
    });

    return res.status(201).json({
      message: "Fallas registradas con éxito",
      count: resultado.count,
    });
  } catch (error) {
    console.error("Error al crear fallas:", error);
    return res.status(500).json({
      message: "Error al registrar las fallas",
    });
  }
};

export const getFailureOfEquipment = async (req: Request, res: Response) => {
  try {
    const id_equipment = Number(req.params.id);
    if (isNaN(id_equipment)) {
      return res.status(400).json({ message: "El ID de equipo no es válido" });
    }
    const failures = await prisma.failure.findMany({
      where: {
        id_equipment: id_equipment,
      },
      include: {
        failureType: true,
      },
    });
    return res.status(200).json(failures);
  } catch (e) {
    console.error("Error en el getFailureOfEquipment: ", e);
    return res.status(500).json({ message: "Error al obtener las fallas de un equipo" });
  }
};