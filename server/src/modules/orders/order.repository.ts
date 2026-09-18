import type { Order as Order_P, Prisma } from "@/generated/prisma/client.js";
import type { PaginatedResult } from "@/shared/base.repository.js";
import type { OrderQueryDto } from "./order.schema.js";
import { BaseRepository } from "@/shared/base.repository.js";
import { v7 as uuidv7 } from "uuid";
import { Order } from "./order.entity.js";
import { toBudgetDomain } from "@/modules/budgets/budget.repository.js";

const orderInclude = {
    equipment: { include: { client: true } },
    statusHistory: true,
    failures: { include: { failureType: true } },
    budget: { include: { addedCosts: true } }, // ← agregado: sin esto, estimatedTotal siempre da undefined
} satisfies Prisma.OrderInclude;

type OrderWithRelations = Order_P & Prisma.OrderGetPayload<{ include: typeof orderInclude }>;

export class OrderRepository extends BaseRepository<Order, OrderQueryDto> {

    public async findAll(query?: OrderQueryDto): Promise<PaginatedResult<Order>> {

        const { page, limit, skip } = this.getPagination(
            query?.page,
            query?.limit,
        );

        const [data, total] = await Promise.all([
            this.prisma.order.findMany({
                skip,
                take: limit,
                where: {
                    observations: {
                        contains: query?.search,
                    },
                },
                orderBy: (query?.sortBy && query?.sortOrder)
                    ? {
                        [query.sortBy]: query.sortOrder,
                    }
                    : undefined,
                include: orderInclude,
            }),

            this.prisma.order.count({
                where: {
                    observations: {
                        contains: query?.search,
                    },
                },
            }),
        ]);

        return {
            data: data.map((order) => this.toDomain(order)),
            metadata: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    public async findById(id: string): Promise<Order | undefined> {
        const order = await this.prisma.order.findUnique({
            where: {
                id_order: id,
            },
            include: orderInclude,
        });

        return order
            ? this.toDomain(order)
            : undefined;
    }

    public async findByEquipmentId(equipmentId: string): Promise<Order[]> {
        const orders = await this.prisma.order.findMany({
            where: {
                id_equipment: equipmentId,
            },
        });

        return orders.map((order) => this.toDomain(order));
    }

    public async create(item: Order, tx?: Prisma.TransactionClient): Promise<Order> {
        const db = tx ?? this.prisma;

        const nroOrder = item.nroOrder ?? await this.getLastOrderNumber();

        const order = await db.order.create({
            data: {
                id_order: uuidv7(),
                nroOrder,
                id_equipment: item.id_equipment,
                id_user: item.id_user,
                status: item.status,
                observations: item.observations,
                equipmentPhotoUrl: item.equipmentPhotoUrl,
                dateOfEntry: item.dateOfEntry,
                estimatedDate: item.estimatedDate,
                deliveryDate: item.deliveryDate,
                totalCharged: item.totalCharged,
            },
        });

        return this.toDomain(order);
    }

    public async update(id: string, item: Partial<Order>): Promise<Order | undefined> {
        const order = await this.prisma.order.update({
            where: {
                id_order: id,
            },
            data: {
                ...item,
            },
        });

        return this.toDomain(order);
    }

    public async delete(id: string): Promise<{ id: string } | undefined> {
        const order = await this.prisma.order.delete({
            where: {
                id_order: id,
            },
        });

        return {
            id: order.id_order,
        };
    }

    private async getLastOrderNumber() {
        const lastOrder = await this.prisma.order.findFirst({
            orderBy: { nroOrder: "desc" },
            select: { nroOrder: true },
        });

        const nextNroOrder = lastOrder ? lastOrder.nroOrder + 1 : 1;
        return nextNroOrder;
    }

    private toDomain(order: Order_P | OrderWithRelations): Order {
        const rawBudget = "budget" in order ? order.budget : undefined;

        const budgetInstance = rawBudget
            ? toBudgetDomain({
                id_budget: rawBudget.id_budget,
                nroBudget: rawBudget.nroBudget,
                id_order: rawBudget.id_order,
                laborCost: rawBudget.laborCost,
                discount: rawBudget.discount,
                status: rawBudget.status,
                budgetDate: rawBudget.budgetDate,
                addedCosts: "addedCosts" in rawBudget ? rawBudget.addedCosts : undefined,
                order: "failures" in order ? { failures: order.failures } : undefined,
            })
            : undefined;

        return new Order(
            order.id_equipment,
            order.id_order,
            order.nroOrder,
            order.id_user ?? undefined,
            order.status,
            order.observations ?? undefined,
            order.equipmentPhotoUrl ?? undefined,
            order.dateOfEntry,
            order.estimatedDate ?? undefined,
            order.deliveryDate ?? undefined,
            order.totalCharged?.toNumber(),
            "equipment" in order ? order.equipment ?? undefined : undefined,
            "statusHistory" in order ? order.statusHistory ?? undefined : undefined,
            "failures" in order ? order.failures ?? undefined : undefined,
            budgetInstance,
        );
    }
}