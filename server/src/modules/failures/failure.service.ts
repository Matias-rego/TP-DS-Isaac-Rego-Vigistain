import type { BaseRepository } from "@/shared/base.repository.js"; 
import type { Failure } from "./failure.entity.js"; 

export class FailureService {
    constructor(private repo: BaseRepository<Failure>) { } 

    findAll(): Promise<Failure[] | undefined> { 
        return this.repo.findAll();
    }
    findById(id: string): Promise<Failure | undefined> { 
        return this.repo.findById(id);
    }
    create(input: Omit<Failure, "id">): Promise<Failure | undefined> { 
        return this.repo.create(input);
    }

    update(id: string, input: Partial<Failure>): Promise<Failure | undefined> { 
        return this.repo.update(id, input);
    }
    
    delete(id: string): Promise<{ id: string } | undefined> { 
        return this.repo.delete(id);
    }
}
