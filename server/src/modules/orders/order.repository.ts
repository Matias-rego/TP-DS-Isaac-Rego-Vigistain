import type { Order as Order_P, Prisma } from "@/generated/prisma/client.js";
import type { PaginatedResult } from "@/shared/base.repository.js";
import type { OrderQueryDto } from "./order.schema.js";
import { BaseRepository } from "@/shared/base.repository.js";
import { v7 as uuidv7 } from "uuid";
import { Order } from "./order.entity.js";
import { $Enums } from "@/database/prisma.js";

// Relaciones que el frontend necesita para armar la fila de la tabla y el
// detalle de la orden (OrderDirectory usa order.equipment?.client y
// order.statusHistory para mostrar cliente, equipo y estado actual).
const orderInclude = {
    equipment: { include: { client: true } },
    statusHistory: true,
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

    // Nuevo: reemplaza al viejo getOrderOfEquipment que pegaba directo a
    // prisma desde el controller y casteaba el id a Number (estaba mal,
    // id_equipment es un uuid string, igual que id_order).
    public async findByEquipmentId(equipmentId: string): Promise<Order[]> {
        const orders = await this.prisma.order.findMany({
            where: {
                id_equipment: equipmentId,
            },
        });

        return orders.map((order) => this.toDomain(order));
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

    public async getStats() {
        const ahora = new Date();
        const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
        const inicioMesSiguiente = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 1);

        const [activas, pendientesPresupuesto, enReparacion, entregadasMes] =
            await Promise.all([
                this.prisma.order.count({
                    where: {
                        status: {
                            notIn: [
                                $Enums.EnumOrderStatus.entregado,
                                $Enums.EnumOrderStatus.cancelado,
                            ],
                        },
                    },
                }),
                this.prisma.order.count({
                    where: {
                        status: {
                            in: [
                                $Enums.EnumOrderStatus.recibido,
                                $Enums.EnumOrderStatus.diagnostico,
                            ],
                        },
                    },
                }),
                this.prisma.order.count({
                    where: { status: $Enums.EnumOrderStatus.reparacion },
                }),
                this.prisma.order.count({
                    where: {
                        status: $Enums.EnumOrderStatus.entregado,
                        deliveryDate: { gte: inicioMes, lt: inicioMesSiguiente },
                    },
                }),
            ]);

        return { activas, pendientesPresupuesto, enReparacion, entregadasMes };
    }

    // Acepta tanto el resultado con relaciones (findAll/findById, que
    // usan `include`) como el plano de create/update/delete (que no lo
    // necesitan) — equipment/statusHistory quedan undefined en ese caso.
    private toDomain(order: Order_P | OrderWithRelations): Order {
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
            order.totalCharged?.toNumber(),
            "equipment" in order ? order.equipment ?? undefined : undefined,
            "statusHistory" in order ? order.statusHistory ?? undefined : undefined,
        );
    }
}