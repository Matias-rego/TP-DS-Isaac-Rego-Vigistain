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

  // 🛡️ Validación más estricta (evita problemas si un ID llega a ser 0)
  const failuresValidas = failures.every(
    (f) => 
      f.id_failure_type !== undefined && f.id_failure_type !== null &&
      f.id_equipment !== undefined && f.id_equipment !== null &&
      f.failureDescription && f.failureDescription.trim() !== ""
  );

  if (!failuresValidas) {
    return res.status(400).json({
      message: "Cada falla necesita id_failure_type, id_equipment y failureDescription.",
    });
  }

  try {
    // Insertamos todas las fallas mapeadas a la estructura de Prisma
    const resultado = await prisma.failure.createMany({
      data: failures.map((f) => ({
        id_failure_type: Number(f.id_failure_type),
        id_equipment: Number(f.id_equipment),
        description: f.failureDescription, // Mapeo de nombre exitoso 🚀
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