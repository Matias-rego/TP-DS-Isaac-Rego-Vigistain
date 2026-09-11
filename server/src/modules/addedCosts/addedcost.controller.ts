import type { NextFunction, Request, Response } from "express";
import type { IdDto } from "@/shared/common.schema.js";
import type { RegisterAddedCostDto, ModifyAddedCostDto, AddedCostQueryDto } from "./addedcost.schema.js";
import type { AddedCostService } from "./addedcost.service.js";

export class AddedCostController {
    constructor(private service: AddedCostService) { }

    public registerAddedCost = async (req: Request, res: Response, next: NextFunction) => {
        const data = req.validated.body as RegisterAddedCostDto;

        try {
            const addedCost = await this.service.create(data);
            return res.status(201).json(addedCost);
        } catch (error) {
            next(error);
        }
    };

    public getAllAddedCosts = async (req: Request, res: Response, next: NextFunction) => {
        const query = req.validated.query as AddedCostQueryDto;

        try {
            res.json(await this.service.findAll(query));
        } catch (error) {
            next(error);
        }
    };

    public getOneAddedCost = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.validated.params as IdDto;

        try {
            const addedCost = await this.service.findById(id);

            if (!addedCost) {
                return res.status(404).json({ message: "Costo adicional no encontrado" });
            }

            return res.json(addedCost);
        } catch (error) {
            next(error);
        }
    };

    public getAddedCostsOfBudget = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.validated.params as IdDto;

        try {
            const addedCosts = await this.service.findByBudgetId(id);
            return res.json(addedCosts);
        } catch (error) {
            next(error);
        }
    };

    public modifyAddedCost = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.validated.params as IdDto;
        const data = req.validated.body as ModifyAddedCostDto;

        try {
            const addedCost = await this.service.update(id, data);
            return res.json(addedCost);
        } catch (error) {
            next(error);
        }
    };

    public deleteAddedCost = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.validated.params as IdDto;

        try {
            const result = await this.service.delete(id);
            return res.json(result);
        } catch (error) {
            next(error);
        }
    };
}
