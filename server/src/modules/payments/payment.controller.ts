import type { Request, Response } from "express";
import type { IdDto } from "@/shared/common.schema.js";
import type { RegisterPaymentDto, PaymentQueryDto } from "./payment.schema.js";
import type { PaymentService } from "./payment.service.js";
import { NotFoundError } from "@/shared/http-errors.js";

export class PaymentController {
    constructor(private service: PaymentService) { }

    public registerPayment = async (req: Request, res: Response) => {
        const data = req.validated.body as RegisterPaymentDto;

        const payment = await this.service.create(data);
        return res.status(201).json(payment);
    };

    public getAllPayments = async (req: Request, res: Response) => {
        const query = req.validated.query as PaymentQueryDto;

        res.json(await this.service.findAll(query));
    };

    public getOnePayment = async (req: Request, res: Response) => {
        const { id } = req.validated.params as IdDto;

        const payment = await this.service.findById(id);

        if (!payment) {
            throw new NotFoundError("Pago no encontrado");
        }

        return res.json(payment);
    };

    public getPaymentsOfBudget = async (req: Request, res: Response) => {
        const { id } = req.validated.params as IdDto;

        const payments = await this.service.findByBudgetId(id);
        return res.json(payments);
    };

    public deletePayment = async (req: Request, res: Response) => {
        const { id } = req.validated.params as IdDto;

        const result = await this.service.delete(id);
        return res.json(result);
    };
}
