import { $Enums } from "@/database/prisma.js";
import type { PaginatedResult } from "@/shared/base.repository.js";
import type { BudgetQueryDto } from "./budget.schema.js";
import type { BudgetRepository } from "./budget.repository.js";
import type { AddedCostRepository } from "@/modules/addedcost/addedcost.repository.js";
import type { StatusService } from "@/modules/status/status.service.js";
import { Budget } from "./budget.entity.js";

interface CreateBudgetInput {
    id_order: string;
    laborCost: number;
    discount?: number;
    id_user: string;
}

export class BudgetService {
    constructor(
        private repo: BudgetRepository,
        // Solo el repository, no el AddedCostService: si dependiera del
        // service entero se armaría un ciclo (AddedCostService ya depende
        // de BudgetService para disparar el recálculo).
        private addedCostRepo: AddedCostRepository,
        private statusService: StatusService,
    ) { }

    findAll(query?: BudgetQueryDto): Promise<PaginatedResult<Budget>> {
        return this.repo.findAll(query);
    }

    findById(id: string): Promise<Budget | undefined> {
        return this.repo.findById(id);
    }

    findByOrderId(id_order: string): Promise<Budget | undefined> {
        return this.repo.findByOrderId(id_order);
    }

    // estimatedTotal = mano de obra + costo estimado de cada falla de la
    // orden (Failure_Type.estimatedImport) - descuento. Todavía no hay
    // AddedCost en este punto (recién se está creando el presupuesto).
    async create(input: CreateBudgetInput): Promise<Budget> {
        const discount = input.discount ?? 0;
        const failureCosts = await this.repo.sumFailureCosts(input.id_order);
        const estimatedTotal = input.laborCost + failureCosts - discount;

        const budget = await this.repo.create({
            id_order: input.id_order,
            laborCost: input.laborCost,
            discount,
            estimatedTotal,
        } as Budget);

        // El presupuesto se genera después del diagnóstico: al crearlo,
        // la orden pasa a "presupuestado".
        await this.statusService.createStatus({
            id_order: input.id_order,
            id_user: input.id_user,
            status: $Enums.EnumOrderStatus.presupuestado,
        });

        return budget;
    }

    async update(id: string, input: Partial<Budget>): Promise<Budget | undefined> {
        // Si cambia laborCost o discount hay que recalcular el total; el
        // resto de los campos (ej. status) se puede actualizar directo.
        if (input.laborCost !== undefined || input.discount !== undefined) {
            return this.recalculateEstimatedTotal(id, input);
        }

        return this.repo.update(id, input);
    }

    // Recalcula y persiste estimatedTotal. La usa tanto update() (si
    // cambia laborCost/discount) como AddedCostService, después de
    // crear/editar/borrar un costo adicional.
    async recalculateEstimatedTotal(id: string, overrides: Partial<Budget> = {}): Promise<Budget | undefined> {
        const current = await this.repo.findById(id);
        if (!current) return undefined;

        const laborCost = overrides.laborCost ?? current.laborCost;
        const discount = overrides.discount ?? current.discount ?? 0;

        const [failureCosts, addedCosts] = await Promise.all([
            this.repo.sumFailureCosts(current.id_order),
            this.addedCostRepo.sumByBudgetId(id),
        ]);

        const estimatedTotal = laborCost + failureCosts + addedCosts - discount;

        return this.repo.update(id, {
            ...overrides,
            laborCost,
            discount,
            estimatedTotal,
        });
    }

    delete(id: string): Promise<{ id: string } | undefined> {
        return this.repo.delete(id);
    }
}
