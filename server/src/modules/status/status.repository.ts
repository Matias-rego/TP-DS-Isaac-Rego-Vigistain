import type { Status_History as StatusHistory_P } from "@/generated/prisma/client.js";
import type { PaginatedResult } from "@/shared/base.repository.js";
import type { StatusQueryDto } from "./status.schema.js";
import { BaseRepository } from "@/shared/base.repository.js";
import { v7 as uuidv7 } from "uuid";
import { StatusHistory } from "./status.entity.js";

export class StatusHistoryRepository extends BaseRepository<StatusHistory, StatusQueryDto> {

    public async findAll(query?: StatusQueryDto): Promise<PaginatedResult<StatusHistory>> {
        const { page, limit, skip } = this.getPagination(
            query?.page,
            query?.limit,
        );

        const [data, total] = await Promise.all([
            this.prisma.status_History.findMany({
                skip,
                take: limit,
                where: {
                    comment: {
                        contains: query?.search,
                    },
                },
                orderBy: (query?.sortBy && query?.sortOrder)
                    ? {
                        [query.sortBy]: query.sortOrder,
                    }
                    : undefined,
            }),

            this.prisma.status_History.count({
                where: {
                    comment: {
                        contains: query?.search,
                    },
                },
            }),
        ]);

        return {
            data: data.map((entry) => this.toDomain(entry)),
            metadata: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    public async findById(id: string): Promise<StatusHistory | undefined> {
        const entry = await this.prisma.status_History.findUnique({
            where: {
                id_status_history: id,
            },
        });

        return entry
            ? this.toDomain(entry)
            : undefined;
    }

    // Historial completo de una orden, ordenado del más viejo al más nuevo.
    public async findByOrderId(id_order: string): Promise<StatusHistory[]> {
        const entries = await this.prisma.status_History.findMany({
            where: { id_order },
            orderBy: { dateOfChange: 'asc' },
        });

        return entries.map((entry) => this.toDomain(entry));
    }

    public async create(item: StatusHistory): Promise<StatusHistory> {
        const entry = await this.prisma.status_History.create({
            data: {
                id_status_history: uuidv7(),
                ...item,
            },
        });

        return this.toDomain(entry);
    }

    public async update(id: string, item: Partial<StatusHistory>): Promise<StatusHistory | undefined> {
        const entry = await this.prisma.status_History.update({
            where: {
                id_status_history: id,
            },
            data: {
                ...item,
            },
        });

        return this.toDomain(entry);
    }

    public async delete(id: string): Promise<{ id: string } | undefined> {
        const entry = await this.prisma.status_History.delete({
            where: {
                id_status_history: id,
            },
        });

        return {
            id: entry.id_status_history,
        };
    }

    private toDomain(entry: StatusHistory_P): StatusHistory {
        return new StatusHistory(
            entry.id_order,
            entry.id_user,
            entry.previousStatus,
            entry.newStatus,
            entry.id_status_history,
            entry.dateOfChange,
            entry.comment ?? undefined,
        );
    }
}