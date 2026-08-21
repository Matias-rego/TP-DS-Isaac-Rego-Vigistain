import type { BaseRepository } from "@/shared/base.repository.js";
import type { Client } from "./client.entity.js";

export class ClientService {
    constructor(private repo: BaseRepository<Client>) { }

    findAll(): Promise<Client[] | undefined> {
        return this.repo.findAll();
    }
    findById(id: string): Promise<Client | undefined> {
        return this.repo.findById(id);
    }
    create(input: Omit<Client, "id">): Promise<Client | undefined> {
        return this.repo.create(input);
    }

    update(id: string, input: Partial<Client>): Promise<Client | undefined> {
        return this.repo.update(id, input);
    }

    delete(id: string): Promise<{ id: string } | undefined >{
        return this.repo.delete(id);
    }
}