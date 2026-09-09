import type { PaginatedResult } from "@/shared/base.repository.js";
import type { OrderQueryDto } from "./order.schema.js";
import type { OrderRepository } from "./order.repository.js";
import type { Order } from "./order.entity.js";
import type { StatusService } from "@/modules/status/status.service.js";

export class OrderService {
    constructor(
        private repo: OrderRepository,
        private statusService: StatusService,
    ) { }

    findAll(query?: OrderQueryDto): Promise<PaginatedResult<Order>> {
        return this.repo.findAll(query);
    }

    findById(id: string): Promise<Order | undefined> {
        return this.repo.findById(id);
    }

    findByEquipmentId(equipmentId: string): Promise<Order[]> {
        return this.repo.findByEquipmentId(equipmentId);
    }

    async create(input: Omit<Order, "id_order">): Promise<Order | undefined> {
        const order = await this.repo.create(input as Order);

        if (order?.id_order && order.status && input.id_user) {
            const id_order = order.id_order;
            const status = order.status;
            const id_user = input.id_user;

            await this.statusService.createFirstStatus(
                id_order,
                id_user,
                status,
            );
        }

        return order;
    }

    update(id: string, input: Partial<Order>): Promise<Order | undefined> {
        return this.repo.update(id, input);
    }

    delete(id: string): Promise<{ id: string } | undefined> {
        return this.repo.delete(id);
    }
}