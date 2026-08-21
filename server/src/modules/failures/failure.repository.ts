import { BaseRepository } from "@/shared/base.repository.js";
import { Failure } from "./failure.entity.js";
import type { Failure as Failure_P } from "@/generated/prisma/client.js";
import { v7 as uuidv7 } from "uuid";

export class FailureRepository extends BaseRepository<Failure> {

    public async findAll(): Promise<Failure[]> {
        const failures = await this.prisma.failure.findMany();

        return failures.map((failure) =>
            this.toDomain(failure),
        );
    }

    public async findById(id: string ): Promise<Failure | undefined> {
        const failure = await this.prisma.failure.findUnique({
            where: {
                id_failure: id,
            },
        });

        return failure
            ? this.toDomain(failure)
            : undefined;
    }

    public async create(item: Failure): Promise<Failure> {
        const failure = await this.prisma.failure.create({
            data: {
                id_failure: uuidv7(),
                ...item,
            },
        });

        return this.toDomain(failure);
    }

    public async update(id: string, item: Partial<Failure>): Promise<Failure | undefined> {
        const failure = await this.prisma.failure.update({
            where: {
                id_failure: id,
            },
            data: {
                ...item,
            },
        });

        return this.toDomain(failure);
    }

    public async delete(id: string ): Promise<{ id: string } | undefined> {
        const failure = await this.prisma.failure.delete({
            where: {
                id_failure: id,
            },
        });

        return {
            id: failure.id_failure,
        };
    }

    private toDomain(failure: Failure_P): Failure {
        return new Failure(
            failure.id_failure_type,
            failure.id_equipment,
            failure.description,
            failure.id_failure,
            failure.dateOfFailure,
            failure.status,
        );
    }
}