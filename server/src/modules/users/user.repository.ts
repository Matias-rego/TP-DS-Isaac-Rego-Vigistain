import type { User as User_P } from "@/generated/prisma/client.js";
import type { PaginatedResult } from "@/shared/base.repository.js"
import type { UserQueryDto } from "./user.schema.js"
import { BaseRepository } from "@/shared/base.repository.js";
import { v7 as uuidv7 } from "uuid";
import { User } from "./user.entity.js";

export class UserRepository extends BaseRepository<User, UserQueryDto> {

    public async findAll(query?: UserQueryDto): Promise<PaginatedResult<User>> {

        const { page, limit, skip } = this.getPagination(
            query?.page,
            query?.limit
        );

        const [data, total] = await Promise.all([
            this.prisma.user.findMany({
                skip,
                take: limit,
                where: {
                    OR: [
                        {
                            email: {
                                contains: query?.search,
                            },
                        }, {
                            userName: {
                                contains: query?.search,
                            },
                        },
                    ],
                },
                orderBy: (query?.sortBy && query?.sortOrder) ? {
                    [query.sortBy]: query.sortOrder,
                } : undefined,
            }),
            this.prisma.user.count({
                where: {
                    OR: [
                        {
                            email: {
                                contains: query?.search,
                            },
                        }, {
                            userName: {
                                contains: query?.search,
                            },
                        },
                    ],
                },
            }),
        ]);

        return {
            data: data.map((user) => this.toDomain(user)),
            metadata: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    public async findById(id: string): Promise<User | undefined> {
        const user = await this.prisma.user.findUnique({
            where: {
                id_user: id,
            },
        });

        return user
            ? this.toDomain(user)
            : undefined;
    }

    public async create(item: User): Promise<User> {
        const user = await this.prisma.user.create({
            data: {
                ...item,
                id_user: uuidv7(),
            },
        });

        return this.toDomain(user);
    }

    public async update(id: string, item: Partial<User>): Promise<User | undefined> {
        const user = await this.prisma.user.update({
            where: {
                id_user: id,
            },
            data: {
                ...item,
            },
        });

        return this.toDomain(user);
    }

    public async delete(id: string): Promise<{ id: string } | undefined> {
        const user = await this.prisma.user.delete({
            where: {
                id_user: id,
            },
        });

        return {
            id: user.id_user,
        };
    }

    private toDomain(user: User_P): User {
        return new User(
            user.userName,
            user.email,
            user.password_hash,
            user.rol,
            user.status,
            user.validationStatus,
            user.urlPicture,
            user.id_user,
        );
    }
}