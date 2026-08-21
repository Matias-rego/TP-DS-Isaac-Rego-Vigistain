import type { Order as Order_P } from "@/generated/prisma/client.js";
import type { PaginatedResult } from "@/shared/base.repository.js";
import type { OrderQueryDto } from "./order.schema.js"
import { BaseRepository } from "@/shared/base.repository.js";
import { v7 as uuidv7 } from "uuid";
import { Order } from "./order.entity.js";

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
        });

        return order
            ? this.toDomain(order)
            : undefined;
    }

    public async create(item: Order): Promise<Order> {
        const order = await this.prisma.order.create({
            data: {
                id_order: uuidv7(),
                ...item,
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

    private toDomain(order: Order_P): Order {
        return new Order(
            order.id_equipment,
            order.id_order,
            order.id_user ?? undefined,
            order.status,
            order.observations ?? undefined,
            order.equipmentPhotoUrl ?? undefined,
            order.dateOfEntry,
            order.estimatedDate ?? undefined,
            order.deliveryDate ?? undefined,
            order.totalCharged?.toNumber(),);
    }
}










