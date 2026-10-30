import type { NewPaymentTypeDto, ModifyPaymentTypeDto, PaymentTypeQueryDto } from "./paymentType.schema.js";
import type { Request, Response } from "express";
import type { PaymentTypeService } from "./paymentType.service.js";
import type { IdDto } from "@/shared/common.schema.js";
import { emitEvent } from "@/websocket.js";
import { EVENTS } from "@/shared/events.js";

export class PaymentTypeController {
    constructor(private service: PaymentTypeService) { }

    public newTypePayment = async (req: Request, res: Response) => {
        const data = req.validated.body as NewPaymentTypeDto;

        const newTypePayment = await this.service.create(data)
        emitEvent(EVENTS.paymentTypeChanged, newTypePayment);
        res.status(201).json(newTypePayment);
    };

    public getAllPaymentTypes = async (req: Request, res: Response) => {
        const query = req.validated.query as PaymentTypeQueryDto;

        res.json(await this.service.findAll(query));
    };


    public deleteTypePayment = async (req: Request, res: Response) => {

        const params = req.validated.params as IdDto;

        await this.service.delete(params.id);
        emitEvent(EVENTS.paymentTypeDeleted, { id: params.id });
        return res.status(200).json({ message: 'Type tailure deleted successfully' });
    };

    public modifyTypePayment = async (req: Request, res: Response) => {
        const data = req.validated.body as ModifyPaymentTypeDto;
        const params = req.validated.params as IdDto

        const updatedTypePayment = await this.service.update(params.id, data)
        emitEvent(EVENTS.paymentTypeChanged, updatedTypePayment);
        res.json(updatedTypePayment);
    };

    public getOneTypePayment = async (req: Request, res: Response) => {
        const params = req.validated.params as IdDto;

        res.json(await this.service.findById(params.id));
    };

}
