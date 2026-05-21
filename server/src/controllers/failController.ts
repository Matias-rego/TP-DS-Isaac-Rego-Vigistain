import { Request, Response } from 'express';
import prisma  from "../database/prisma.js"
import { empty } from '@prisma/client/runtime/library';

export const getPartialTypes = async (req: Request, res: Response) => {
    try {
        console.log('Query recibida:', req.params.query); 

        const result = await prisma.failure_Type.findMany({
            where: {
                failureDescription: {
                    contains: String(req.params.query),
                    
                }
            }
        });

        return res.status(200).json(result);

    } catch (error) {
        console.error('Error en getTypesFail:', error); 
        return res.status(500).json({ message: "Error interno del servidor", error });
    }
};
export const createTypeFail = async (req:Request, res:Response) => {
    try{
        console.log('Data recibida:', req.body);
        const { failureDescription, estimatedImport } = req.body;
        const newTypeFailure = await prisma.failure_Type.create({      
            data: {
                failureDescription,
                estimatedImport
            }
        })
        return res.status(201).json(newTypeFailure);
    }catch(error) {
        console.error('Error en getTypesFail:', error); 
        return res.status(500).json({ message: "Error interno del servidor", error });
    }
}
export const getAllTypes = async (req: Request, res: Response) => {
    try {
        const result = await prisma.failure_Type.findMany();

        if (!result || result.length === 0) {
            return res.status(404).json({ message: 'No se encontraron tipos de falla' });
        }

        return res.status(200).json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al obtener los tipos de falla' });
    }
}
export const deleteType = async (req:Request, res:Response) => {
    try{
        const result = await prisma.failure_Type.delete({
            where: {id_failure_type : Number(req.params.id)}
        })
        return res.status(200).json({ message: 'Tipo de falla eliminado correctamente' });
    }catch(e){
        return res.status(500).json({ message: 'Error al eliminar un tipo de falla' });
    }
} 
export const modifyType = async (req:Request, res:Response) => {
    const data: any = {};
    if (req.body.failureDescription) data.failureDescription = req.body.failureDescription;
    if (req.body.estimatedImport)    data.estimatedImport    = req.body.estimatedImport;  
    try{
        const result = await prisma.failure_Type.update({
            where: {id_failure_type : Number(req.params.id_failure_type)},
            data
        });
        res.json({
            user: result,
            success: 'Tipo de falla modificado correctamente',
        })
    }catch(e){
        console.error('Error modificando Tipo Falla');
        res.status(500).json({ error: 'Error al modificar usuario' });
    }
};