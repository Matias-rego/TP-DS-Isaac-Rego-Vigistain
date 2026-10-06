import type { BaseQuery } from "@/types/pagination";

export interface Client {
  id_client: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  cuit: string;
  id_client_type?: string;
  dateOfRegistration?: string; 
  status?: boolean;
}

export interface CreateClientDto {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  cuit: string;
  id_client_type?: string;
}

export type UpdateClientDto = Partial<CreateClientDto>;

export interface ClientsQuery extends BaseQuery {
  id_client_type?: string;
  dateFrom?: string;
  dateTo?: string;
}