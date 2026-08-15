import {Request, Response} from 'express';
import type { IdDto } from '@/shared/common.schema.js';
import prisma from '@/database/prisma.js';

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