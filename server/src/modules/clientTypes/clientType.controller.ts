import type { ModifyClientTypeDto, NewClientTypeDto, ClientTypeQueryDto } from "./clientType.schema.js";
import type { Request, Response } from "express";
import type { ClientTypeService } from "./clientType.service.js"
import type { IdDto } from "@/shared/common.schema.js";
import { emitEvent } from "@/websocket.js";
import { EVENTS } from "@/shared/events.js";

export class ClientTypeController {
    constructor(private service: ClientTypeService) { }

    public getAllClientTypes = async (req: Request, res: Response) => {
        const query = req.validated.query as ClientTypeQueryDto;

        res.json(await this.service.findAll(query));
    };

    public getOneClientTypes = async (req: Request, res: Response) => {
        const params = req.validated.params as IdDto;

        res.json(await this.service.findById(params.id));
    };

    public deleteClientType = async (req: Request, res: Response) => {
        const params = req.validated.params as IdDto;

        await this.service.delete(params.id);
        emitEvent(EVENTS.clientCategoryDeleted, params.id );
        res.status(200).json({ message: "Client deleted successfully" });
    };

    public newClientType = async (req: Request, res: Response) => {
        const data = req.validated.body as NewClientTypeDto;

        const newClientType = await this.service.create(data);
        emitEvent(EVENTS.clientCategoryChanged, newClientType);
        return res.status(201).json(newClientType);
    }

    public modifyClientType = async (req: Request, res: Response) => {
        const data = req.validated.body as ModifyClientTypeDto;
        const params = req.validated.params as IdDto

        const updatedClientType = await this.service.update(params.id, data)
        emitEvent(EVENTS.clientCategoryChanged, updatedClientType);
        res.json(updatedClientType);
    };
}