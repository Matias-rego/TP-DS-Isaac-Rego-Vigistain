import type { $Enums } from "@/database/prisma.js";

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
    ) { }
}
