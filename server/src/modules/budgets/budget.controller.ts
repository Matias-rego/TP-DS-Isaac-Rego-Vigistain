import type { Request, Response } from "express";
import type { IdDto } from "@/shared/common.schema.js";
import type { RegisterBudgetDto, ModifyBudgetDto, BudgetQueryDto } from "./budget.schema.js";
import type { BudgetService } from "./budget.service.js";
import { enviarPdfPorMail } from '@/service/mail.service.js'; 
import {assertBudgetWithRelations} from "@/pdf/renderBudgetPdf.js"
import jwt from 'jsonwebtoken';
import { config } from "@/utils/config.js";
import { verifyBudgetToken, type BudgetTokenPayload } from "@/utils/budgetToken.js";
import { DECISION_TO_STATUS, isDecision } from "./budget.schema.js";
import { emitEvent } from "@/websocket.js";
import { EVENTS } from "@/shared/events.js";
import { BadRequestError, NotFoundError, UnauthorizedError } from "@/shared/http-errors.js";


export class BudgetController {
    constructor(private service: BudgetService) { }

    public registerBudget = async (req: Request, res: Response) => {
        const data = req.validated.body as RegisterBudgetDto;

        if (!req.user) {
            throw new UnauthorizedError("No autenticado");
        }

        const budget = await this.service.create({
            id_order: data.id_order,
            laborCost: data.laborCost,
            discount: data.discount,
            id_user: req.user.id,
        });
        emitEvent(EVENTS.budgetChanged, budget);
        return res.status(201).json(budget);
    };

    public getAllBudgets = async (req: Request, res: Response) => {
        const query = req.validated.query as BudgetQueryDto;

        res.json(await this.service.findAll(query));
    };

    public getOneBudget = async (req: Request, res: Response) => {
        const { id } = req.validated.params as IdDto;

        const budget = await this.service.findById(id);

        if (!budget) {
            throw new NotFoundError("Presupuesto no encontrado");
        }

        return res.json(budget);
    };

    public getBudgetOfOrder = async (req: Request, res: Response) => {
        const { id } = req.validated.params as IdDto;

        const budget = await this.service.findByOrderId(id);

        if (!budget) {
            throw new NotFoundError("Esta orden no tiene presupuesto");
        }

        return res.json(budget);
    };

    public modifyBudget = async (req: Request, res: Response) => {
        const { id } = req.validated.params as IdDto;
        const data = req.validated.body as ModifyBudgetDto;
        const budget = await this.service.update(id, data);
        emitEvent(EVENTS.budgetChanged, budget);
        return res.json(budget);
    };

    public deleteBudget = async (req: Request, res: Response) => {
        const { id } = req.validated.params as IdDto;

        const result = await this.service.delete(id);
        emitEvent(EVENTS.budgetDeleted, { id });
        return res.json(result);
    };
    public sendBudgetEmail = async (req: Request, res: Response) => {
        const { id } = req.validated.params as IdDto;

        const budget = await this.service.findById(id);

        if (!budget) {
            throw new NotFoundError("Presupuesto no encontrado.");
        }

        assertBudgetWithRelations(budget);

        const tokenVerificacionPres = jwt.sign(
            { nroBudget: budget.nroBudget, id_budget: budget.id_budget },
            config.JWT_SECRET,
            { expiresIn: '48h' }
        );

        await enviarPdfPorMail(budget, tokenVerificacionPres);

        return res.status(200).json({ message: "Presupuesto enviado por mail correctamente." });
    };
    public handleResponse = async (req: Request, res: Response) => {
        const {token} = req.params;
        const { decision, client_suggestion } = req.body;
        if (typeof token !== 'string') {
            throw new BadRequestError('Token no proporcionado o inválido');
        }
        if (!isDecision(decision)) {
            throw new BadRequestError('Decisión inválida');
        }
        const suggestion = typeof client_suggestion === 'string' ? client_suggestion.trim() : '';
        if (decision === 'suggestion' && !suggestion) {
            throw new BadRequestError('Falta la sugerencia');
        };
        let payload: BudgetTokenPayload;
        try {
            payload = verifyBudgetToken(token);
        } catch {
            throw new UnauthorizedError('Token inválido o expirado');
        }

        await this.service.respondToBudget(payload.id_budget, {
            status: DECISION_TO_STATUS[decision],
            client_suggestion: decision === 'suggestion' ? suggestion : null,
        });
        emitEvent(EVENTS.budgetChanged, { id_budget: payload.id_budget, decision, client_suggestion: suggestion });
        return res.json({ ok: true });
    };
    public getBudgetByToken = async (req: Request, res: Response) => {
        let payload: BudgetTokenPayload;
        try {
            payload = verifyBudgetToken(String(req.params.token));
        } catch {
            throw new UnauthorizedError('Token inválido o expirado');
        }

        const budget = await this.service.findById(payload.id_budget);
        return res.json(budget);
    };
    public modifyBudgetTech = async (req: Request, res: Response) => {
        const { id } = req.validated.params as IdDto;
        const data = req.validated.body as ModifyBudgetDto;

        const budget = await this.service.modifyBudget(id, data);
        return res.json(budget);
    };
}
