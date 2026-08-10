import type { Request, Response } from "express";
import prisma from "@/database/prisma.js"; 

interface FailureInput {
  id_failure_type: number;
  failureDescription: string;
  id_equipment: number;
}

export const createFailures = async (req: Request, res: Response) => {
  const failures = req.body as FailureInput[];

  if (!Array.isArray(failures) || failures.length === 0) {
    return res.status(400).json({
      message: "Se esperaba un array de fallas con al menos un elemento.",
    });
  }
  const errores: string[] = [];
  failures.forEach((f, i) => {
    if (f.id_failure_type === undefined || f.id_failure_type === null) {
      errores.push(`Falla #${i + 1}: falta id_failure_type.`);
    }
    if (f.id_equipment === undefined || f.id_equipment === null) {
      errores.push(`Falla #${i + 1}: falta id_equipment.`);
    }
    if (!f.failureDescription || f.failureDescription.trim() === "") {
      errores.push(`Falla #${i + 1}: falta la descripción.`);
    }
  });

  if (errores.length > 0) {
    return res.status(400).json({
      message: "Hay fallas incompletas.",
      details: errores,
    });
  }

  try {
    const resultado = await prisma.failure.createMany({
      data: failures.map((f) => ({
        id_failure_type: Number(f.id_failure_type),
        id_equipment: Number(f.id_equipment),
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