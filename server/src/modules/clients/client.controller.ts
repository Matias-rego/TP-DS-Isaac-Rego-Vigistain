import type { Request, Response } from "express";
import { emitEvent } from "@/websocket.js";
import { EVENTS } from "@/shared/events.js";
import type { IdDto } from "@/shared/common.schema.js";
import type { ModifyClientDto, CreateClientDto, ClientQueryDto } from "./client.schema.js";
import type { ClientService } from "./client.service.js";
import { NotFoundError } from "@/shared/http-errors.js";

export class ClientController {
    constructor(private service: ClientService) { }

    public createClient = async (req: Request, res: Response) => {
        const data = req.validated.body as CreateClientDto;

        const newClient = await this.service.create(data);
        emitEvent(EVENTS.clientChanged, newClient);
        return res.status(201).json(newClient);
    };

    // Cubre listado, búsqueda por nombre/email/cuit y filtro por categoría
    // (lo que antes era getPartialClient) en un solo endpoint.
    public getAllClients = async (req: Request, res: Response) => {
        const query = req.validated.query as ClientQueryDto;

        res.json(await this.service.findAll(query));
    };

    public getOneClient = async (req: Request, res: Response) => {
        const { id } = req.validated.params as IdDto;

        const client = await this.service.findById(id);

        if (!client) {
            throw new NotFoundError("Cliente no encontrado");
        }

        return res.json(client);
    };

    public modifyClient = async (req: Request, res: Response) => {
        const { id } = req.validated.params as IdDto;
        const data = req.validated.body as ModifyClientDto;

        const modifiedClient = await this.service.update(id, data);
        emitEvent(EVENTS.clientChanged, modifiedClient);
        return res.json(modifiedClient);
    };

    public deleteClient = async (req: Request, res: Response) => {
        const { id } = req.validated.params as IdDto;

        const client = await this.service.update(id, { status: false });

        if (!client) {
            throw new NotFoundError("Cliente no encontrado");
        }

        emitEvent(EVENTS.clientChanged, client);
        return res.json(client);
    };
}