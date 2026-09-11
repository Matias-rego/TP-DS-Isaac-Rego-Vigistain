import type { NextFunction, Request, Response } from "express";
import type { IdDto } from "@/shared/common.schema.js";
import type { RegisterBudgetDto, ModifyBudgetDto, BudgetQueryDto } from "./budget.schema.js";
import type { BudgetService } from "./budget.service.js";

export class BudgetController {
    constructor(private service: BudgetService) { }

    public registerBudget = async (req: Request, res: Response, next: NextFunction) => {
        const data = req.validated.body as RegisterBudgetDto;

        if (!req.user) {
            return res.status(401).json({ message: "No autenticado" });
        }

        try {
            const budget = await this.service.create({
                id_order: data.id_order,
                laborCost: data.laborCost,
                discount: data.discount,
                id_user: req.user.id,
            });

            return res.status(201).json(budget);
        } catch (error) {
            next(error);
        }
    };

    public getAllBudgets = async (req: Request, res: Response, next: NextFunction) => {
        const query = req.validated.query as BudgetQueryDto;

        try {
            res.json(await this.service.findAll(query));
        } catch (error) {
            next(error);
        }
    };

    public getOneBudget = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.validated.params as IdDto;

        try {
            const budget = await this.service.findById(id);

            if (!budget) {
                return res.status(404).json({ message: "Presupuesto no encontrado" });
            }

            return res.json(budget);
        } catch (error) {
            next(error);
        }
    };

    public getBudgetOfOrder = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.validated.params as IdDto;

        try {
            const budget = await this.service.findByOrderId(id);

            if (!budget) {
                return res.status(404).json({ message: "Esta orden no tiene presupuesto" });
            }

            return res.json(budget);
        } catch (error) {
            next(error);
        }
    };

    public modifyBudget = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.validated.params as IdDto;
        const data = req.validated.body as ModifyBudgetDto;

        try {
            const budget = await this.service.update(id, data);
            return res.json(budget);
        } catch (error) {
            next(error);
        }
    };

    public deleteBudget = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.validated.params as IdDto;

        try {
            const result = await this.service.delete(id);
            return res.json(result);
        } catch (error) {
            next(error);
        }
    };
}
