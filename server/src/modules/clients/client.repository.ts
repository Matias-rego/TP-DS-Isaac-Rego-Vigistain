import { BaseRepository } from "@/shared/base.repository.js";
import { Client } from "./client.entity.js";
import type { Client as Client_P } from "@/generated/prisma/client.js";
import { v7 as uuidv7 } from "uuid";

export class ClientRepository extends BaseRepository<Client> {

    public async findAll(): Promise<Client[]> {
        const clients = await this.prisma.client.findMany();

        return clients.map((client) =>
            this.toDomain(client),
        );
    }

    public async findById(id: string ): Promise<Client | undefined> {
        const client = await this.prisma.client.findUnique({
            where: {
                id_client: id,
            },
        });

        return client
            ? this.toDomain(client)
            : undefined;
    }

    public async create(item: Client): Promise<Client> {
        const client = await this.prisma.client.create({
            data: {
                id_client: uuidv7(),
                ...item,
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

    public async delete(id: string ): Promise<{ id: string } | undefined> {
        const client = await this.prisma.client.delete({
            where: {
                id_client: id,
            },
        });

        return {
            id: client.id_client,
        };
    }

    private toDomain(client: Client_P): Client {
        return new Client(
            client.clientName,
            client.clientEmail,
            client.clientPhone,
            client.cuit,
            client.id_client_type,
            client.id_client,
            client.dateOfRegistration,
            client.status,
        );
    }
}