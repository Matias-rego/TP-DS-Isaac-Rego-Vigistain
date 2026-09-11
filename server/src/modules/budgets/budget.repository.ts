import type { Budget as Budget_P } from "@/generated/prisma/client.js";
import type { PaginatedResult } from "@/shared/base.repository.js";
import type { BudgetQueryDto } from "./budget.schema.js";
import { BaseRepository } from "@/shared/base.repository.js";
import { Budget } from "./budget.entity.js";
import { v7 as uuidv7 } from "uuid";

export class BudgetRepository extends BaseRepository<Budget, BudgetQueryDto> {

    public async findAll(query?: BudgetQueryDto): Promise<PaginatedResult<Budget>> {
        const { page, limit, skip } = this.getPagination(
            query?.page,
            query?.limit,
        );

        const [data, total] = await Promise.all([
            this.prisma.budget.findMany({
                skip,
                take: limit,
                orderBy: (query?.sortBy && query?.sortOrder)
                    ? { [query.sortBy]: query.sortOrder }
                    : undefined,
            }),
            this.prisma.budget.count(),
        ]);

        return {
            data: data.map((budget) => this.toDomain(budget)),
            metadata: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    public async findById(id: string): Promise<Budget | undefined> {
        const budget = await this.prisma.budget.findUnique({
            where: { id_budget: id },
        });

        return budget ? this.toDomain(budget) : undefined;
    }

    // id_order es unique en Budget: una orden tiene a lo sumo un presupuesto.
    public async findByOrderId(id_order: string): Promise<Budget | undefined> {
        const budget = await this.prisma.budget.findUnique({
            where: { id_order },
        });

        return budget ? this.toDomain(budget) : undefined;
    }

    // Suma Failure_Type.estimatedImport de todas las fallas de la orden.
    // Es una de las partes de estimatedTotal (junto con laborCost,
    // AddedCost y discount).
    public async sumFailureCosts(id_order: string): Promise<number> {
        const failures = await this.prisma.failure.findMany({
            where: { id_order },
            select: {
                failureType: {
                    select: { estimatedImport: true },
                },
            },
        });

        return failures.reduce(
            (sum, f) => sum + f.failureType.estimatedImport.toNumber(),
            0,
        );
    }

    public async create(item: Budget): Promise<Budget> {
        const budget = await this.prisma.budget.create({
            data: {
                id_budget: uuidv7(),
                id_order: item.id_order,
                laborCost: item.laborCost,
                discount: item.discount,
                estimatedTotal: item.estimatedTotal,
            },
        });

        return this.toDomain(budget);
    }

    public async update(id: string, item: Partial<Budget>): Promise<Budget | undefined> {
        const budget = await this.prisma.budget.update({
            where: { id_budget: id },
            data: {
                ...item,
            },
        });

        return this.toDomain(budget);
    }

    public async delete(id: string): Promise<{ id: string } | undefined> {
        const budget = await this.prisma.budget.delete({
            where: { id_budget: id },
        });

        return { id: budget.id_budget };
    }

    private toDomain(budget: Budget_P): Budget {
        return new Budget(
            budget.id_order,
            budget.laborCost.toNumber(),
            budget.estimatedTotal.toNumber(),
            budget.id_budget,
            budget.discount.toNumber(),
            budget.status,
        );
    }
}
