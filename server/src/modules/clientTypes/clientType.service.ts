import type { BaseRepository, PaginatedResult } from "@/shared/base.repository.js";
import type { ClientTypeQueryDto } from "./clientType.schema.js"
import type { ClientType } from "./clientType.entity.js";
import { ConflictError } from "@/shared/http-errors.js";
import { ClientTypeRepository } from "./clientType.repository.js"
export interface ClientTypeResponseDto {
    id: string;
    name: string;
}

export class ClientTypeService {
    constructor(private repo: ClientTypeRepository) { }

    findAll(query?: ClientTypeQueryDto): Promise<PaginatedResult<ClientType>> {
        return this.repo.findAll(query);
    }

    findById(id: string): Promise<ClientType | undefined> {
        return this.repo.findById(id);
    }
    
    create(input: Omit<ClientType, "id">): Promise<ClientType | undefined> {
        return this.repo.create(input);
    }

    update(id: string, input: Partial<ClientType>): Promise<ClientType | undefined> {
        return this.repo.update(id, input);
    }
    
    async delete(id: string): Promise<{ id: string } | undefined> {
        const clientsUsingType = await this.repo.countClientsByType(id);
        if(clientsUsingType > 0){
            throw new ConflictError(`No se puede eliminar: hay ${clientsUsingType} cliente(s) registrado(s) con este tipo.`,)
        }
        return this.repo.delete(id);
    }
}
