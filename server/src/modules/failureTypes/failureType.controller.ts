import type { ModifyFailureTypeDto, FailureTypeQueryDto, NewFailureTypeDto } from './failureType.schema.js';
import type { Request, Response } from 'express';
import type { FailureTypeService } from './failureType.service.js';
import type { IdDto } from "@/shared/common.schema.js";
import { emitEvent } from "@/websocket.js";
import { EVENTS } from "@/shared/events.js";

export class FailureTypeController {
    constructor(private service: FailureTypeService) { }

    public getAllFailureType = async (req: Request, res: Response) => {
        const query = req.validated.query as FailureTypeQueryDto;

        res.json(await this.service.findAll(query));
    };

    public getOneFailureType = async (req: Request, res: Response) => {
        const params = req.validated.params as IdDto;

        res.json(await this.service.findById(params.id));
    };

    public newFailureType = async (req: Request, res: Response) => {
        const data = req.validated.body as NewFailureTypeDto;

        const newTypeFailure = this.service.create(data);
        emitEvent(EVENTS.failureTypeChanged, newTypeFailure);
        return res.status(201).json(newTypeFailure);
    }

    public deleteFailureType = async (req: Request, res: Response) => {
        const params = req.validated.params as IdDto;

        await this.service.delete(params.id);
        emitEvent(EVENTS.failureTypeDeleted, { id: params.id });
        return res.status(200).json({ message: 'Type tailure deleted successfully' });
    }

    public modifyFailureType = async (req: Request, res: Response) => {
        const data = req.validated.body as ModifyFailureTypeDto;
        const params = req.validated.params as IdDto

        const updatedFailureType = await this.service.update(params.id, data)
        emitEvent(EVENTS.failureTypeChanged, updatedFailureType);
        res.json(updatedFailureType);
    };
};