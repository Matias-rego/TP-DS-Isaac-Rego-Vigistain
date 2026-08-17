import type { Request, Response } from "express";
import prisma from "@/database/prisma.js";
import { emitEvent } from "@/websocket.js";
import { EVENTS } from "@/shared/events.js";
import type { ModifyClientDto, CreateClientDto } from "./client.schema.js";

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

  try {
    const { clientName, clientEmail, clientPhone, cuit }: CreateClientDto = req.body;
    const category = await getCategoryClientByOrders(0);
    console.log(category);
    const newClient = await prisma.client.create({
      data: {
        clientName,
        clientEmail,
        clientPhone,
        cuit,
        category_client: {
          connect: {
            id_category_client: category?.id_category_client,
          },
        },
      }
    })
    emitEvent(EVENTS.clientChanged, newClient);
    return res.status(201).json(newClient)
  } catch (error) {
    console.error(`Error en el createNewClient, ${error}`);
    return res.status(500).json({ message: "Error del servidor" })
  }
}

export const getAllClients = async (req: Request, res: Response) => {
  try {
    const clients = await prisma.client.findMany();
    res.json(clients);
  } catch (error) {
    console.error(`Error getting all clients, ${error}`);
    res.status(500).json({ error: "Error al obtener todos los clientes" })
  }
}

export const getOneClient = async (req: Request, res: Response) => {
  try {
    const client = await prisma.client.findUnique({
      where: {
        id_client: Number(req.params.id),
      }
    });
    res.json(client);
  } catch (error) {
    console.error("Error en el getOneClient, Server");
    res.status(500).json({ error: "Error al obtener un cliente", errorData: error })
  }
}
export const modifyClient = async (req: Request, res: Response) => {
  const data: ModifyClientDto = {};
  if (req.body.clientName) data.clientName = req.body.clientName;
  if (req.body.clientEmail) data.clientEmail = req.body.clientEmail;
  if (req.body.cuit) data.cuit = req.body.cuit;
  if (req.body.clientPhone) data.clientPhone = req.body.clientPhone;
  try {
    const modifyClient = await prisma.client.update({
      where: { id_client: Number(req.params.id) },
      data: data,
    })
    emitEvent(EVENTS.clientChanged, modifyClient);
    res.json(modifyClient);
  } catch (error) {
    console.error("Error en el modifyClient", error);
    res.status(500).json({ error: "Error modificando al cliente" });
  }
}

export const getPartialClient = async (req: Request, res: Response) => {
  try {
    const { q, categoryClient} = req.query;
    const clients = await prisma.client.findMany({
      where: {
        AND: [
          q ? {
            OR: [
              { clientName: { contains: q as string } },
              { clientEmail: { contains: q as string } },
              { cuit: { contains: q as string } },
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
    return res.status(200).json(clients);
  } catch (error) {
    console.error("Error fetching partial clients:", error);
    res.status(500).json({ error: "Error en el getPartialClient" });
  }
};