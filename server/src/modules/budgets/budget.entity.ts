import type { $Enums } from "@/database/prisma.js";

export class Budget {
    constructor(
        public id_order: string,
        public laborCost: number,
        public estimatedTotal: number,
        public id_budget?: string,
        public discount?: number,
        public status?: $Enums.EnumBudgetStatus,
    ) { }
}
