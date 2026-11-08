import type { Client as Client_P, Client_Type, Prisma } from "@/generated/prisma/client.js";
import type { PaginatedResult } from "@/shared/base.repository.js";
import type { ClientQueryDto } from "./client.schema.js";
import { BaseRepository } from "@/shared/base.repository.js";
import { Client } from "./client.entity.js";
import { v7 as uuidv7 } from "uuid";

type ClientRow = Client_P & { client_type?: Client_Type | null };

export class ClientRepository extends BaseRepository<Client, ClientQueryDto> {

    public async findAll(query?: ClientQueryDto): Promise<PaginatedResult<Client>> {
        const { page, limit, skip } = this.getPagination(
            query?.page,
            query?.limit,
        );

        const where = {
            AND: [
                query?.search ? {
                    OR: [
                        { clientName: { contains: query.search } },
                        { clientEmail: { contains: query.search } },
                        { cuit: { contains: query.search } },
                    ],
                } : {},
                query?.id_client_type ? {
                    id_client_type: query.id_client_type,
                } : {},
                query?.dateFrom ? {
                    dateOfRegistration: { gte: new Date(query.dateFrom) },
                } : {},
                query?.dateTo ? {
                    dateOfRegistration: { lte: new Date(query.dateTo) },
                } : {},
            ],
        };

        const [data, total] = await Promise.all([
            this.prisma.client.findMany({
                skip,
                take: limit,
                where,
                orderBy: (query?.sortBy && query?.sortOrder)
                    ? {
                        [query.sortBy]: query.sortOrder,
                    }
                    : undefined,
                include:{
                    client_type: true
                }
            }),

            this.prisma.client.count({ where }),
        ]);

        return {
            data: data.map((client) => this.toDomain(client)),
            metadata: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    public async findById(id: string): Promise<Client | undefined> {
        const client = await this.prisma.client.findUnique({
            where: {
                id_client: id,
            },
        });

        return client
            ? this.toDomain(client)
            : undefined;
    }

    public async findDefaultCategoryForOrderCount(orderCount: number, tx: Prisma.TransactionClient = this.prisma): Promise<{ id_client_type: string } | undefined> {
        const category = await tx.client_Type.findFirst({
            where: {
                amountForCategoryUp: {
                    lte: orderCount,
                },
            },
            orderBy: {
                amountForCategoryUp: 'desc',
            },
            select: {
                id_client_type: true,
            },
        });

        return category ?? undefined;
    }

    public async findAmountOrderOfEquiment(id_client: string, tx: Prisma.TransactionClient = this.prisma): Promise<number> {
        const count = await tx.order.count({
            where: {
                equipment: {
                    id_client: id_client,
                },
            },
        });
        return count;
    }
    public async updateClientType(id_client:string, id_client_type:string, tx: Prisma.TransactionClient = this.prisma){
        await tx.client.update({
            where: { id_client },
            data: { id_client_type }
        });
    }
    public async create(item: Client): Promise<Client> {
        const client = await this.prisma.client.create({
            data: {
                id_client: uuidv7(),
                clientName: item.clientName,
                clientEmail: item.clientEmail,
                clientPhone: item.clientPhone,
                cuit: item.cuit,
                id_client_type: item.id_client_type as string,
                dateOfRegistration: item.dateOfRegistration,
                status: item.status,
            },
        });

        return this.toDomain(client);
    }

    public async update(id: string, item: Partial<Client>): Promise<Client | undefined> {
        const client = await this.prisma.client.update({
            where: {
                id_client: id,
            },
            data: {
                ...item,
            },
        });

        return this.toDomain(client);
    }

    public async delete(id: string): Promise<{ id: string } | undefined> {
        const client = await this.prisma.client.delete({
            where: {
                id_client: id,
            },
        });

        return {
            id: client.id_client,
        };
    }
    public async findByEmail(email: string) {
        return this.prisma.client.findFirst({ where: { clientEmail: email } });
    }
    public async findByCuit(cuit: string) {
        return this.prisma.client.findFirst({ where: { cuit: cuit } });
    }

    private toDomain(client: ClientRow): Client {
        const domain = new Client(
            client.clientName,
            client.clientEmail,
            client.clientPhone,
            client.cuit,
            client.id_client_type,
            client.id_client,
            client.dateOfRegistration,
            client.status,
        );
        if (client.client_type) domain.client_type = client.client_type;
        return domain;
    }
}