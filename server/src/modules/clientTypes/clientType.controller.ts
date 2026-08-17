import type { Request, Response, NextFunction } from "express";
import prisma from "@/database/prisma.js";
import { emitEvent } from "@/websocket.js";
import { EVENTS } from "@/shared/events.js";
import type { ModifyClientTypeDto, NewClientTypeDto } from "./clientType.schema.js";
import type { IdDto } from "@/shared/common.schema.js";

export const getAllClientTypes = async (req: Request, res: Response) => {
  try {
    const clientCategories = await prisma.category_Client.findMany();
    res.json(clientCategories);
  } catch (error) {
    console.error("Error fetching clients:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteClientType = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params as unknown as IdDto;
  try {
    await prisma.category_Client.delete({
      where: { id_category_client: Number(id) }
    });
    emitEvent(EVENTS.clientCategoryDeleted, { id: Number(id)});
    res.status(200).json({ message: "Client deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const getPartialClientTypes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await prisma.category_Client.findMany({
      where: {
        categoryClientName: {
          contains: req.params.description as string,
        }
      }
    });
    if (result.length === 0) return res.status(200).json([]);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const newClientType = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { categoryClientName, amountForCategoryUp }: NewClientTypeDto = req.body;
    const newCategoryClient = await prisma.category_Client.create({
      data: {
        categoryClientName,
        amountForCategoryUp
      }
    })
    emitEvent(EVENTS.clientCategoryChanged, newCategoryClient);
    return res.status(201).json(newCategoryClient);
  } catch (error) {
    next(error)
  }
}

export const modifyClientType = async (req: Request, res: Response, next: NextFunction) => {
  const data: ModifyClientTypeDto = {};
  if (req.body.categoryClientName) data.categoryClientName = req.body.categoryClientName;
  if (req.body.amountForCategoryUp) data.amountForCategoryUp = req.body.amountForCategoryUp;
  try {
    const updatedCategoryClient = await prisma.category_Client.update({
      where: { id_category_client: Number(req.params.id) },
      data: data
    });
    emitEvent(EVENTS.clientCategoryChanged, updatedCategoryClient);
    res.json(updatedCategoryClient);
  } catch (error) {
    next(error);
  }
};
