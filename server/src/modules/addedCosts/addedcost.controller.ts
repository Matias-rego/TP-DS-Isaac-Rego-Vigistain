import type { Request, Response } from "express";
import type { IdDto } from "@/shared/common.schema.js";
import type { RegisterAddedCostDto, ModifyAddedCostDto, AddedCostQueryDto } from "./addedcost.schema.js";
import type { AddedCostService } from "./addedcost.service.js";
import { emitEvent } from "@/websocket.js";
import { NotFoundError } from "@/shared/http-errors.js";

export class AddedCostController {
    constructor(private service: AddedCostService) { }

    public registerAddedCost = async (req: Request, res: Response) => {
        const data = req.validated.body as RegisterAddedCostDto;

        const addedCost = await this.service.create(data);
        emitEvent("addedCost:changed", addedCost);
        return res.status(201).json(addedCost);
    };

    public getAllAddedCosts = async (req: Request, res: Response) => {
        const query = req.validated.query as AddedCostQueryDto;

        res.json(await this.service.findAll(query));
    };

    public getOneAddedCost = async (req: Request, res: Response) => {
        const { id } = req.validated.params as IdDto;

        const addedCost = await this.service.findById(id);

        if (!addedCost) {
            throw new NotFoundError("Costo adicional no encontrado");
        }

        return res.json(addedCost);
    };

    public getAddedCostsOfBudget = async (req: Request, res: Response) => {
        const { id } = req.validated.params as IdDto;

        const addedCosts = await this.service.findByBudgetId(id);
        return res.json(addedCosts);
    };

    public modifyAddedCost = async (req: Request, res: Response) => {
        const { id } = req.validated.params as IdDto;
        const data = req.validated.body as ModifyAddedCostDto;

        const addedCost = await this.service.update(id, data);
        emitEvent("addedCost:changed", addedCost);
        return res.json(addedCost);
    };

    public deleteAddedCost = async (req: Request, res: Response) => {
        const { id } = req.validated.params as IdDto;

        const result = await this.service.delete(id);
        emitEvent("addedCost:deleted", { id });
        return res.json(result);
    };
    public getTotalByBudget = async (req: Request, res: Response) => {
        const { id_budget } = req.params;
        try {
            const total = await this.service.sumByBudgetId(String(id_budget));
            res.status(200).json({ total });
        } catch (error) {
            console.error("Error en getTotalByBudget:", error);
            throw error;
        }
    };
}
