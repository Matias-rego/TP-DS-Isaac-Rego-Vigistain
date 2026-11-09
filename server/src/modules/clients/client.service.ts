import type { PaginatedResult } from "@/shared/base.repository.js";
import type { ClientQueryDto } from "./client.schema.js";
import type { ClientRepository } from "./client.repository.js";
import type { Client } from "./client.entity.js";
import { ConflictError } from "@/shared/http-errors.js";
import type { Prisma } from "@/generated/prisma/client.js";

type Tx = Parameters<ClientRepository["findAmountOrderOfEquiment"]>[1];
type CreateClientInput = Omit<Client, "id_client" | "id_client_type" | "client_type">;


export class ClientService {
    constructor(private repo: ClientRepository) { }

    findAll(query?: ClientQueryDto): Promise<PaginatedResult<Client>> {
        return this.repo.findAll(query);
    }

    findById(id: string): Promise<Client | undefined> {
        return this.repo.findById(id);
    }
    async create(input: CreateClientInput): Promise<Client | undefined>{
        const category = await this.repo.findDefaultCategoryForOrderCount(0);

        if (!category) {
            throw new Error("No hay una categoría de cliente configurada para asignar");
        }

        const mailClient = await this.repo.findByEmail(input.clientEmail);
        if (mailClient) {
            throw new ConflictError(
                "El correo ingresado ya pertenece a otro cliente",
                { field: "clientEmail" },
            );
        }

        const cuitClient = await this.repo.findByCuit(input.cuit);
        if (cuitClient) {
            throw new ConflictError(
                "El CUIT ingresado ya pertenece a otro cliente",
                { field: "cuit" },
            );
        }

        return this.repo.create({
            ...input,
            id_client_type: category.id_client_type,
        } as Client);
    }

    update(id: string, input: Partial<Client>): Promise<Client | undefined> {
        return this.repo.update(id, input);
    }

    delete(id: string): Promise<{ id: string } | undefined> {
        return this.repo.delete(id);
    }

    async updateClientType(id: string, tx?: Tx): Promise<void> {
        const orderCount = await this.repo.findAmountOrderOfEquiment(id, tx);
        const category = await this.repo.findDefaultCategoryForOrderCount(orderCount, tx);

        if (category) {
            await this.repo.updateClientType(id, category.id_client_type, tx);
        }
    }
}