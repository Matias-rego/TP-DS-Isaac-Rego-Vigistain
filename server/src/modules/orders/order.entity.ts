import type { $Enums } from "@/database/prisma.js";
import type { Equipment, Client, Status_History } from "@/generated/prisma/client.js";

export class Order {
    constructor(
        public id_equipment: string,
        public id_order?: string,
        public id_user?: string,
        public status?: $Enums.EnumOrderStatus,
        public observations?: string,
        public equipmentPhotoUrl?: string,
        public dateOfEntry?: Date,
        public estimatedDate?: Date,
        public deliveryDate?: Date,
        public totalCharged?: number,
        // Relaciones opcionales: solo vienen pobladas cuando el repository
        // las pide con `include` (findAll/findById). En create/update van
        // undefined.
        public equipment?: Equipment & { client?: Client | null },
        public statusHistory?: Status_History[],
    ) { }
}