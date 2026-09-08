export class StatusHistory {
    constructor(
        public id_order: string,
        public id_user: string,
        public previousStatus: string,
        public newStatus: string,
        public id_status_history?: string,
        public dateOfChange?: Date,
        public comment?: string,
    ) { }
}