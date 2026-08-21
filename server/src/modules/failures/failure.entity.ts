import type { $Enums } from "@/database/prisma.js";

export class Failure {
    constructor(
        public id_failure_type: string,
        public id_equipment: string,
        public description: string,
        public id_failure?: string,
        public dateOfFailure?: Date,
        public status?: $Enums.EnumFailureStatus,
    ) { }
}
 