import type { Prisma } from "@/generated/prisma/client.js";

export const ORDER_FILTERS = ["activas", "pendientes", "reparacion", "entregado"] as const;
export type OrderFilter = (typeof ORDER_FILTERS)[number];

export const orderFilterWhere = (filtro: OrderFilter): Prisma.OrderWhereInput => {
    switch (filtro) {
        case "activas":
            return { status: { notIn: ["entregado", "cancelado"] } };
        case "pendientes":
            return { status: { in: ["recibido", "diagnostico"] } };
        case "reparacion":
            return { status: "reparacion" };
        case "entregado": {
            const now = new Date();
            return {
                status: "entregado",
                deliveryDate: {
                    gte: new Date(now.getFullYear(), now.getMonth(), 1),
                    lt: new Date(now.getFullYear(), now.getMonth() + 1, 1),
                },
            };
        }
    }
};