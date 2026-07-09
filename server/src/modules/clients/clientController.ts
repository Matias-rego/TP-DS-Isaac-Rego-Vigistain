import { Request, Response } from "express";
import prisma from "@/database/prisma.js";

async function getCategoryClientByOrders(orderCount: number) {
  try {
    const category = await prisma.category_Client.findFirst({
      where: {
        amountForCategoryUp: {
          lte: orderCount,
        },
      },
    });

    return category;
  } catch (error) {
    console.error("Error al encontrar la categoría del cliente", error);
    return null;
  }
}

export const createNewClient = async (req: Request, res: Response) => {
    
    try{
        const { clientName, clientEmail, clientPhone, dniCuit } = req.body;
        const category = await getCategoryClientByOrders(0);
        console.log(category);
        const newClient = await prisma.client.create({
            data:{
                clientName,
                clientEmail, 
                clientPhone,
                dniCuit,
                category_client: {
                connect: {
                    id_category_client: category?.id_category_client,
                    },
                },
            }
        })
        return res.status(201).json(newClient)
    }catch(error){
        console.error(`Error en el createNewClient, ${error}`);
        return res.status(500).json({message: "Error del servidor"})
    }
}

export const getAllClients = async (req:Request, res: Response) => {
    try{
        const clients = await prisma.client.findMany();
        res.json(clients);
    }catch(error){
        console.error(`Error getting all clients, ${error}`);
        res.status(500).json({error: "Error al obtener todos los clientes"})
    }
}

export const getOneClient = async (req:Request, res: Response) => {
    try{
        const client = await prisma.client.findUnique({
            where: {
                id_client:Number(req.params.id),
            }
        });
        res.json(client);
    }catch(error){
        console.error("Error en el getOneClient, Server");
        res.status(500).json({error : "Error al obtener un cliente", errorData : error})
    }
}
export const modifyClient = async (req:Request, res:Response) => {
    const data: any = {};
    if(req.body.clientName) data.clientName = req.body.clientName;
    if(req.body.clientEmail) data.clientEmail = req.body.clientEmail;
    if(req.body.dniCuit) data.dniCuit = req.body.dniCuit;
    if(req.body.clientPhone) data.clientPhone = req.body.clientPhone;
    try{
        const modifyClient = await prisma.client.update({
            where: { id_client: Number(req.params.id_client)},
            data: data,
        })
        res.json(modifyClient);
    }catch(error){
        console.error("Error en el modifyClient");
        res.status(500).json({error:"Error modificando al cliente"});
    }
}

export const getPartialClient = async (req: Request, res: Response) => {
  try {
    const { q, categoryClient, fecha } = req.query;
    const clients = await prisma.client.findMany({
      where: {
        AND: [
          q ? {
            OR: [
              { clientName: { contains: q as string } },
              { clientEmail: { contains: q as string } },
              { dniCuit: { contains: q as string } },
            ]
          } : {},
          categoryClient ? {
            category_client: { categoryClientName: { contains: categoryClient as string } }
          } : {},
        ]
      },
      include: {
        category_client: { select: { categoryClientName: true } }
      }
    });
    if (clients.length === 0) return res.status(404).json([]);
    res.json(clients);
  } catch (error) {
    console.error("Error fetching partial clients:", error);
    res.status(500).json({ error: "Error en el getPartialClient" });
  }
};