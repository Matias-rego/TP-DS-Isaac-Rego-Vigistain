import {Request, Response} from 'express';
import prisma from '@/database/prisma.js';

export const uploadPhotoCloud = async (req:Request, res:Response) =>{
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

export const registerEquipment = async (req:Request,res:Response) => {
    try{
        const { tipo_equipment, brand, model, observations, id_client } = req.body;
        const result = await prisma.equipment.create({
            data:{
                tipo_equipment,
                brand,
                model,
                observations,
                id_client
            }
        });
        return res.status(201).json(result)
    }catch(error){
        console.error("Error: ", error);
        return res.status(500).json({
        message: "Error al registrar el Equipo",
        });
    }
}