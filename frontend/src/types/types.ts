export type EnumRol = 'admin' | 'tecnico';

export type EnumEquipmentType =
  | 'celular'
  | 'computadora'
  | 'tablet'
  | 'consola'
  | 'otro';

export type EnumOrderStatus =
  | 'recibido'
  | 'diagnostico'
  | 'presupuestado'
  | 'aprobado'
  | 'reparacion'
  | 'listo'
  | 'entregado'
  | 'cancelado';

export type EnumBudgetStatus = 'pendiente' | 'aprobado' | 'rechazado';

export type EnumPaymentMethod = 'DEBITO' | 'MP' | 'EFECTIVO' | 'CREDITO';

export type EnumPaymentType = 'Descuento' | 'Recargo';

export type EnumFailureStatus = 'resuelta' | 'diagnosticada';

export interface User {
  id_user: number;
  userName: string;
  email: string;
  password_hash: string;
  rol: EnumRol;
  status: boolean;
  validationStatus: boolean;
  urlPicture: string;
  orders?: Order[];
  statusHistory?: Status_History[];
}

export interface Category_Client {
  id_category_client: number;
  categoryClientName: string;
  amountForCategoryUp: number; 
  clients?: Client[];
}

export interface Client {
  id_client: number;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  cuit: string;
  dateOfRegistration: string; 
  status: boolean;
  id_category_client: number;
  category_client?: Category_Client;
  equipments?: Equipment[];
}

export interface Failure_Type {
  id_failure_type: number;
  failureDescription: string;
  estimatedImport: number; 
  failures?: Failure[];
}

export interface Failure {
  id_failure: number;
  id_failure_type: number;
  id_equipment: number;
  description: string;
  dateOfFailure: string; 
  status: EnumFailureStatus;
  failureType?: Failure_Type;
  equipment?: Equipment;
}

export interface Equipment {
  id_equipment: number;
  tipo_equipment: string;
  brand: string;
  model: string;
  observations?: string | null;
  id_client: number;
  client?: Client;
  failures?: Failure[];
  orders?: Order[];
}

export interface Order {
  id_order: number;
  id_equipment: number;
  id_user: number; 
  observations?: string | null;
  equipmentPhotoUrl?: string | null;
  dateOfEntry: string; 
  estimatedDate?: string | null;
  deliveryDate?: string | null;
  totalCharged?: number | null;
  equipment?: Equipment;
  user?: User;
  statusHistory?: Status_History[];
  budget?: Budget | null;
}

export interface Status_History {
  id_status_history: number;
  id_order: number;
  status: EnumOrderStatus; 
  id_user: number;
  dateOfChange: string;
  comment?: string | null;
  order?: Order;
  user?: User;
}

export interface Budget {
  id_budget: number;
  id_order: number;
  laborCost: number;
  discount: number;
  estimatedTotal: number;
  status: EnumBudgetStatus;
  order?: Order;
  payments?: Payment[];
}

export interface Payment_Type {
  id_payment_type: number;
  paymentTypeName: string;
  paymentMethod: EnumPaymentMethod;
  type_of_payment: EnumPaymentType;
  percentaje: number;
  payments?: Payment[];
}

export interface Payment {
  id_payment: number;
  id_payment_type: number;
  id_budget: number;
  dateOfPayment: string; 
  amount: number;
  paymentType?: Payment_Type;
  budget?: Budget;
}