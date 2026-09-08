import type { $Enums } from "@/database/prisma.js";
import type { PaginatedResult } from "@/shared/base.repository.js";
import type { StatusQueryDto } from "./status.schema.js";
import type { StatusHistoryRepository } from "./status.repository.js";
import type { OrderRepository } from "@/modules/orders/order.repository.js";
import type { StatusHistory } from "./status.entity.js";

interface CreateStatusInput {
    id_order: string;
    id_user: string;
    newStatus: $Enums.EnumOrderStatus;
    comment?: string;
}

export class StatusService {
    constructor(
        private repo: StatusHistoryRepository,
        private orderRepo: OrderRepository,
    ) { }

    findAll(query?: StatusQueryDto): Promise<PaginatedResult<StatusHistory>> {
        return this.repo.findAll(query);
    }

    findById(id: string): Promise<StatusHistory | undefined> {
        return this.repo.findById(id);
    }

    findByOrderId(id_order: string): Promise<StatusHistory[]> {
        return this.repo.findByOrderId(id_order);
    }

    // Cambio de estado "normal": guarda el historial con el status anterior
    // real de la orden, y deja la orden actualizada al nuevo estado.
    async createStatus(input: CreateStatusInput): Promise<StatusHistory> {
        const order = await this.orderRepo.findById(input.id_order);

        if (!order) {
            throw new Error("La orden no existe");
        }

        const entry = await this.repo.create({
            id_order: input.id_order,
            id_user: input.id_user,
            previousStatus: order.status,
            newStatus: input.newStatus,
            comment: input.comment,
        } as StatusHistory);

        await this.orderRepo.update(input.id_order, { status: input.newStatus });

        return entry;
    }

    // Se llama una sola vez, al registrar la orden. No hay "estado
    // anterior" real todavía, así que previousStatus queda igual a
    // newStatus para dejar constancia de que fue la creación.
    async createFirstStatus(id_order: string, id_user: string, status: $Enums.EnumOrderStatus): Promise<StatusHistory> {
        return this.repo.create({
            id_order,
            id_user,
            previousStatus: status,
            newStatus: status,
            comment: "Orden creada",
        } as StatusHistory);
    }
}