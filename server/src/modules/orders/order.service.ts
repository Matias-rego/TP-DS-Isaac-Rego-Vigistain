import type { BaseRepository } from "@/shared/base.repository.js"; 
import type { PaginatedResult } from "@/shared/base.repository.js"
import type { OrderQueryDto } from "./order.schema.js"
import type { Order } from "./order.entity.js"; 


export class OrderService {
    constructor(private repo: BaseRepository<Order>) { } 

    findAll(query?: OrderQueryDto): Promise<PaginatedResult<Order>> { 
        return this.repo.findAll(query);
    }
    findById(id: string): Promise<Order | undefined> { 
        return this.repo.findById(id );
    }
    create(input: Omit<Order, "id">): Promise<Order | undefined> { 
        return this.repo.create(input);
    }

    update(id: string, input: Partial<Order>): Promise<Order | undefined> { 
        return this.repo.update(id, input);
    }
    
    delete(id: string): Promise<{ id: string } | undefined> { 
        return this.repo.delete(id);
    }
}
