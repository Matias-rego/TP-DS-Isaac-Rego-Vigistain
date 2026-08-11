import { Request, Response } from 'express';
import prisma from "@/database/prisma.js";
import { EnumRol, Prisma } from "@/generated/prisma/browser.js";


export const getAllUsers = async (req: Request, res: Response) => {
    try{
        const users = await prisma.user.findMany({
            where: {
                status:true,
            },
        });
        if (!users || users.length === 0) {
            return res.status(404).json({ error: 'No se encontraron usuarios' });
        }
        // sacar al usuario el password_hash
        res.json(users.map((user) => {
            const { password_hash, ...rest } = user;
            return rest;
        }));
    }catch(e){
        console.error('Error en getAllUsers:', e);
        res.status(500).json({error:'Error interno del server'})
    }
 }

export const getPartialUser = async (req: Request, res: Response) => {
    try {
        const { q, rol, validationStatus } = req.query;

        const whereConditions: Prisma.UserWhereInput[] = [];
        if (typeof q === 'string' && q.trim() !== '') {
            whereConditions.push({
                OR: [
                    { userName: { contains: q} },
                    { email: { contains: q} },
                ],
            });
        }
        if (typeof rol === 'string' && rol.trim() !== '') {
            whereConditions.push({
                rol: rol as EnumRol, 
            });
        }
        if (validationStatus !== undefined) {
            whereConditions.push({
                validationStatus: validationStatus === 'true',
            });
        }
        const users = await prisma.user.findMany({
            where: whereConditions.length > 0 ? { AND: whereConditions } : {},
            select: {
                id_user: true,
                userName: true,
                email: true,
                rol: true,
                status: true,
                validationStatus: true,
            },
        });
        res.json(users);
    } catch (e) {
        console.error('Error en getPartialUser:', e);
        res.status(500).json({ error: 'Error del server en getPartialUser' });
    }
};

export const createUser = async (req: Request, res: Response) => { }

export const deleteUser = async (req: Request, res: Response) => { }

export const getUser = async (req: Request, res: Response) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id_user: Number(req.params.id) }
        });

        if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

        res.json(user); // ← objeto directo, sin array
    } catch (e) {
        console.error('Error en getUser:', e);
        res.status(500).json({ error: 'Error interno' });
    }
};

export const modifyUser = async (req: Request, res: Response) => {
    const fotoUrl = (req.file as any)?.path ?? null;

    const data: any = {};
    if (req.body.username) data.userName = req.body.username;
    if (req.body.email) data.email = req.body.email;
    if (fotoUrl) data.urlPicture = fotoUrl;
    if (req.body.rol) data.rol = req.body.rol;
    if (req.body.validationStatus !== undefined) data.validationStatus = req.body.validationStatus;

    if (Object.keys(data).length === 0) {
        return res.status(400).json({ error: 'No hay datos para actualizar' });
    }

    try {
        const rta = await prisma.user.update({
            where: { id_user: Number(req.params.id) },
            data
        });
        res.json({
            user: rta,
            success: 'Usuario modificado exitosamente'
        });
    } catch (e) {
        console.error('Error en modifyUser:', e);
        res.status(500).json({ error: 'Error al modificar usuario' });
    }
};