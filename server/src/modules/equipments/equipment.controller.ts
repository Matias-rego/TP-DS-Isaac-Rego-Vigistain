import type { Request, Response } from 'express';
import prisma from '@/database/prisma.js';
import type { RegisterEquipmentDto } from './equipment.schema.js';


export const uploadPhotoCloud = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se recibió ninguna imagen.' });
    }
    return res.status(200).json({
      url: req.file.path
    });
  } catch (error) {
    console.error('Error en el endpoint de subida:', error);
    return res.status(500).json({ message: 'Error interno del servidor al procesar la foto.' });
  }
};

export const registerEquipment = async (req: Request, res: Response) => {
  try {
    const { tipo_equipment, brand, model, observations, id_client }: RegisterEquipmentDto = req.body;
    const result = await prisma.equipment.create({
      data: {
        tipo_equipment,
        brand,
        model,
        observations,
        id_client
      }
    });
    return res.status(201).json(result)
  } catch (error) {
    console.error("Error: ", error);
    return res.status(500).json({
      message: "Error al registrar el Equipo",
    });
  }
}

export const getPartialEquipment = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== 'string' || q.trim() === '') {
      return res.status(200).json([]);
    }
    const searchTerm = q.trim();
    const equipments = await prisma.equipment.findMany({
      where: {
        OR: [
          { brand: { contains: searchTerm } },
          { model: { contains: searchTerm } },
          { tipo_equipment: { contains: searchTerm } },
        ],
      },
      include: {
        client: true,
      }
    });

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