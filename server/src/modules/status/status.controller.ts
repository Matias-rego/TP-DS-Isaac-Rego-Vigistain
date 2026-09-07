import {Request, Response} from 'express';
import type { IdDto } from '@/shared/common.schema.js';
import prisma from '@/database/prisma.js';
import { emitEvent } from '@/websocket.js';
import { EVENTS } from '@/shared/events.js';
import { updateOrderCurrentStatus } from '../orders/order.controller.js';

export const createFirstStatus = async ( id_user:IdDto['id'], id_order:IdDto['id']) => {
    try{
        const response = await prisma.status_History.create({
            data:{
                id_order: id_order,
                id_user: id_user
            }
        })
        if (response) return true;
    }catch(e){
        return false;
    }
};

export const createStatus = async (req:Request, res:Response) => {
    try{
        const { id_order, status, id_user, comment, notifyClient } = req.body;
        //Usariamos el notifyClient para manejar la notificacion al cliente
        const state = await prisma.status_History.create({
            data:{
                id_order: id_order,
                id_user: id_user,
                status: status,
                comment:comment
            },
        })
        if (!state) {
        return res.status(400).json({ message: "Error en la creación del estado" });
        }
        await updateOrderCurrentStatus(Number(id_order), status);
        emitEvent(EVENTS.statusChanged, state);
        return res.status(200).json(state);
    }catch (e){
        console.error("Error en server", e);
        res.status(500).json({"Error en server": e});
    }
}