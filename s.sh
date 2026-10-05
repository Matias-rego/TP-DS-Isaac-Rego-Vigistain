cd /home/mati/Datos/nextcloud/Obsidian/facu/3_anio/DW/TP-DS-Isaac-Rego-Vigistain/frontend   # ajustá la ruta
cd src/features
mkdir -p users auth failureTypes failures paymentTypes payments equipments orders status budgets addedCosts

# ───────────────────────── USERS ─────────────────────────
cat > users/types.ts <<'EOF'
import type { BaseQuery } from '@/types/pagination';
import type { EnumRol } from '@/types/types';

export interface User {
  id_user: string;
  userName: string;
  email: string;
  rol: EnumRol;
  status?: boolean;
  validationStatus?: boolean;
  urlPicture?: string;
}

export interface UpdateUserDto {
  userName?: string;
  email?: string;
  urlPicture?: string;
  rol?: EnumRol;
  validationStatus?: boolean;
}

export interface UsersQuery extends BaseQuery {
  sortBy?: 'userName' | 'email' | 'rol' | 'id_user';
}
EOF
cat > users/users.service.ts <<'EOF'
import { http } from '@/lib/http';
import type { PaginatedResponse } from '@/types/pagination';
import type { User, UpdateUserDto, UsersQuery } from './types';

const BASE = 'users';

export const usersService = {
  getAll: (params: UsersQuery, signal?: AbortSignal) =>
    http.get<PaginatedResponse<User>>(BASE, { params, signal }),

  getById: (id: string, signal?: AbortSignal) =>
    http.get<User>(`${BASE}/${id}`, { signal }),

  update: (id: string, data: UpdateUserDto) =>
    http.put<User>(`${BASE}/${id}`, data),

  // El backend hace baja lógica (status = false)
  remove: (id: string) => http.delete<User>(`${BASE}/${id}`),
};
EOF

# ───────────────────────── AUTH ─────────────────────────
cat > auth/types.ts <<'EOF'
import type { EnumRol } from '@/types/types';

export interface LoginDto { username: string; password: string }
export interface RegisterDto { username: string; email: string; password: string; urlPicture?: string }
export interface ForgotPasswordDto { email: string }
export interface ResetPasswordDto { password: string }

export interface Me {
  id_user: string;
  userName: string;
  email: string;
  rol: EnumRol;
  urlPicture: string;
  status: boolean;
}

export interface MessageResponse { message: string }
EOF
cat > auth/auth.service.ts <<'EOF'
import { http } from '@/lib/http';
import type {
  LoginDto, RegisterDto, ForgotPasswordDto, ResetPasswordDto, Me, MessageResponse,
} from './types';

const BASE = 'auth';

export const authService = {
  login: (data: LoginDto) => http.post<MessageResponse>(`${BASE}/login`, data),
  register: (data: RegisterDto) => http.post<MessageResponse>(`${BASE}/register`, data),
  logout: () => http.post<MessageResponse>(`${BASE}/logout`),
  me: (signal?: AbortSignal) => http.get<Me>(`${BASE}/me`, { signal }),
  forgotPassword: (data: ForgotPasswordDto) =>
    http.post<MessageResponse>(`${BASE}/forgot-password`, data),
  resetPassword: (token: string, data: ResetPasswordDto) =>
    http.post<MessageResponse>(`${BASE}/reset-password/${token}`, data),
  validateAccount: (token: string) =>
    http.put<{ success: boolean; message: string }>(`${BASE}/validate/${token}`),
};
EOF

# ───────────────────────── FAILURE TYPES ─────────────────────────
cat > failureTypes/types.ts <<'EOF'
import type { BaseQuery } from '@/types/pagination';

export interface FailureType {
  id_failure_type: string;
  failureDescription: string;
  estimatedImport: number | string; // Prisma Decimal llega como string en JSON
}

export interface CreateFailureTypeDto {
  failureDescription: string;
  estimatedImport: number;
}
export type UpdateFailureTypeDto = Partial<CreateFailureTypeDto>;

export interface FailureTypesQuery extends BaseQuery {
  sortBy?: 'failureDescription' | 'estimatedImport' | 'id_failure_type';
}
EOF
cat > failureTypes/failureTypes.service.ts <<'EOF'
import { http } from '@/lib/http';
import type { PaginatedResponse } from '@/types/pagination';
import type {
  FailureType, CreateFailureTypeDto, UpdateFailureTypeDto, FailureTypesQuery,
} from './types';

const BASE = 'failure-types';

export const failureTypesService = {
  getAll: (params: FailureTypesQuery, signal?: AbortSignal) =>
    http.get<PaginatedResponse<FailureType>>(BASE, { params, signal }),
  getById: (id: string, signal?: AbortSignal) =>
    http.get<FailureType>(`${BASE}/${id}`, { signal }),
  create: (data: CreateFailureTypeDto) => http.post<FailureType>(BASE, data),
  update: (id: string, data: UpdateFailureTypeDto) =>
    http.put<FailureType>(`${BASE}/${id}`, data),
  remove: (id: string) => http.delete<{ message: string }>(`${BASE}/${id}`),
};
EOF

# ───────────────────────── FAILURES ─────────────────────────
cat > failures/types.ts <<'EOF'
import type { EnumFailureStatus } from '@/types/types';
import type { FailureType } from '@/features/failureTypes/types';

export interface Failure {
  id_failure: string;
  id_failure_type: string;
  id_order: string;
  description: string;
  dateOfFailure: string;
  status: EnumFailureStatus;
  failureType?: FailureType;
}

export interface CreateFailureItemDto {
  id_failure_type: string;
  failureDescription: string;
  id_order: string;
}
export type CreateFailuresDto = CreateFailureItemDto[]; // el backend espera un array

// Ojo: el backend exige AMBOS campos en el PUT
export interface UpdateFailureDto {
  id_failure_type: string;
  description: string;
}

export interface CreateFailuresResponse { message: string; failures: Failure[] }
export interface UpdateFailureResponse { message: string; failure: Failure }
export interface DeleteFailureResponse { message: string; res: Failure }
export interface TotalResponse { total: number }
EOF
cat > failures/failures.service.ts <<'EOF'
import { http } from '@/lib/http';
import type {
  Failure, CreateFailuresDto, CreateFailuresResponse, UpdateFailureDto,
  UpdateFailureResponse, DeleteFailureResponse, TotalResponse,
} from './types';

const BASE = 'failures';

export const failuresService = {
  getByOrder: (idOrder: string, signal?: AbortSignal) =>
    http.get<Failure[]>(`${BASE}/ofOrder/${idOrder}`, { signal }),
  getTotalByOrder: (idOrder: string, signal?: AbortSignal) =>
    http.get<TotalResponse>(`${BASE}/ofOrder/${idOrder}/total`, { signal }),
  createMany: (data: CreateFailuresDto) =>
    http.post<CreateFailuresResponse>(BASE, data),
  update: (id: string, data: UpdateFailureDto) =>
    http.put<UpdateFailureResponse>(`${BASE}/${id}`, data),
  remove: (id: string) => http.delete<DeleteFailureResponse>(`${BASE}/${id}`),
};
EOF

# ───────────────────────── PAYMENT TYPES ─────────────────────────
cat > paymentTypes/types.ts <<'EOF'
import type { BaseQuery } from '@/types/pagination';
import type { EnumPaymentMethod, EnumPaymentType } from '@/types/types';

export interface PaymentType {
  id_payment_type: string;
  paymentTypeName: string;
  paymentMethod: EnumPaymentMethod;
  type_of_payment: EnumPaymentType;
  percentage: number | string;
}

export interface CreatePaymentTypeDto {
  paymentTypeName: string;
  paymentMethod: EnumPaymentMethod;
  type_of_payment: EnumPaymentType;
  percentage: number;
}
export type UpdatePaymentTypeDto = Partial<CreatePaymentTypeDto>;

export interface PaymentTypesQuery extends BaseQuery {
  sortBy?: 'paymentTypeName' | 'paymentMethod' | 'type_of_payment' | 'id_payment_type' | 'percentage';
}
EOF
cat > paymentTypes/paymentTypes.service.ts <<'EOF'
import { http } from '@/lib/http';
import type { PaginatedResponse } from '@/types/pagination';
import type {
  PaymentType, CreatePaymentTypeDto, UpdatePaymentTypeDto, PaymentTypesQuery,
} from './types';

const BASE = 'payment-types';

export const paymentTypesService = {
  getAll: (params: PaymentTypesQuery, signal?: AbortSignal) =>
    http.get<PaginatedResponse<PaymentType>>(BASE, { params, signal }),
  getById: (id: string, signal?: AbortSignal) =>
    http.get<PaymentType>(`${BASE}/${id}`, { signal }),
  create: (data: CreatePaymentTypeDto) => http.post<PaymentType>(BASE, data),
  update: (id: string, data: UpdatePaymentTypeDto) =>
    http.put<PaymentType>(`${BASE}/${id}`, data),
  remove: (id: string) => http.delete<{ message: string }>(`${BASE}/${id}`),
};
EOF

# ───────────────────────── PAYMENTS (router NO montado en el backend) ─────────────────────────
cat > payments/types.ts <<'EOF'
import type { BaseQuery } from '@/types/pagination';
import type { PaymentType } from '@/features/paymentTypes/types';

export interface Payment {
  id_payment: string;
  id_payment_type: string;
  id_budget: string;
  dateOfPayment: string;
  amount: number | string;
  paymentType?: PaymentType;
}

export interface CreatePaymentDto {
  id_budget: string;
  id_payment_type: string;
  amount: number;
}

export interface PaymentsQuery extends BaseQuery {
  sortBy?: 'amount' | 'dateOfPayment';
}
EOF
cat > payments/payments.service.ts <<'EOF'
import { http } from '@/lib/http';
import type { PaginatedResponse } from '@/types/pagination';
import type { Payment, CreatePaymentDto, PaymentsQuery } from './types';

// ⚠ payment.routes.ts no está montado en server/src/api/routes.ts
const BASE = 'payments';

export const paymentsService = {
  getAll: (params: PaymentsQuery, signal?: AbortSignal) =>
    http.get<PaginatedResponse<Payment>>(BASE, { params, signal }),
  getById: (id: string, signal?: AbortSignal) =>
    http.get<Payment>(`${BASE}/${id}`, { signal }),
  getByBudget: (idBudget: string, signal?: AbortSignal) =>
    http.get<Payment[]>(`${BASE}/ofBudget/${idBudget}`, { signal }),
  create: (data: CreatePaymentDto) => http.post<Payment>(BASE, data),
  remove: (id: string) => http.delete<Payment>(`${BASE}/${id}`),
};
EOF

# ───────────────────────── EQUIPMENTS ─────────────────────────
cat > equipments/types.ts <<'EOF'
import type { BaseQuery } from '@/types/pagination';
import type { EnumEquipmentType } from '@/types/types';

export interface Equipment {
  id_equipment: string;
  tipo_equipment: EnumEquipmentType;
  brand: string;
  model: string;
  observations?: string | null;
  id_client: string;
}

export interface CreateEquipmentDto {
  tipo_equipment: EnumEquipmentType;
  brand: string;
  model: string;
  observations?: string | null;
  id_client: string;
}
export type UpdateEquipmentDto = Partial<CreateEquipmentDto>;

export interface EquipmentsQuery extends BaseQuery {
  sortBy?: 'tipo_equipment' | 'brand' | 'model' | 'id_client' | 'id_equipment' | 'observations';
}
EOF
cat > equipments/equipments.service.ts <<'EOF'
import { http } from '@/lib/http';
import type { PaginatedResponse } from '@/types/pagination';
import type {
  Equipment, CreateEquipmentDto, UpdateEquipmentDto, EquipmentsQuery,
} from './types';

const BASE = 'equipments';

export const equipmentsService = {
  getAll: (params: EquipmentsQuery, signal?: AbortSignal) =>
    http.get<PaginatedResponse<Equipment>>(BASE, { params, signal }),
  getById: (id: string, signal?: AbortSignal) =>
    http.get<Equipment>(`${BASE}/${id}`, { signal }),
  getByClient: (idClient: string, signal?: AbortSignal) =>
    http.get<Equipment[]>(`${BASE}/equipmentForClient/${idClient}`, { signal }),
  create: (data: CreateEquipmentDto) => http.post<Equipment>(BASE, data),
  update: (id: string, data: UpdateEquipmentDto) =>
    http.put<Equipment>(`${BASE}/${id}`, data),
  remove: (id: string) => http.delete<Equipment>(`${BASE}/${id}`),
};
EOF

# ───────────────────────── STATUS ─────────────────────────
cat > status/types.ts <<'EOF'
import type { BaseQuery } from '@/types/pagination';
import type { EnumOrderStatus } from '@/types/types';

export interface StatusHistory {
  id_status_history: string;
  id_order: string;
  id_user: string;
  status: EnumOrderStatus;
  dateOfChange: string;
  comment?: string | null;
  user?: { userName: string; urlPicture?: string };
}

export interface RegisterStatusDto {
  id_order: string;
  id_user: string; // el schema lo exige, aunque el controller usa el del token
  status: EnumOrderStatus;
  comment?: string;
  notifyClient?: boolean;
}

export interface StatusQuery extends BaseQuery {
  sortBy?: 'dateOfChange' | 'status';
}
EOF
cat > status/status.service.ts <<'EOF'
import { http } from '@/lib/http';
import type { PaginatedResponse } from '@/types/pagination';
import type { StatusHistory, RegisterStatusDto, StatusQuery } from './types';

const BASE = 'status';

export const statusService = {
  getAll: (params: StatusQuery, signal?: AbortSignal) =>
    http.get<PaginatedResponse<StatusHistory>>(BASE, { params, signal }),
  getByOrder: (idOrder: string, signal?: AbortSignal) =>
    http.get<StatusHistory[]>(`${BASE}/ofOrder/${idOrder}`, { signal }),
  register: (data: RegisterStatusDto) => http.post<StatusHistory>(BASE, data),
};
EOF

# ───────────────────────── ORDERS ─────────────────────────
cat > orders/types.ts <<'EOF'
import type { BaseQuery } from '@/types/pagination';
import type { EnumOrderStatus, EnumEquipmentType } from '@/types/types';
import type { Equipment } from '@/features/equipments/types';
import type { Client } from '@/features/clients/types';
import type { Failure } from '@/features/failures/types';
import type { StatusHistory } from '@/features/status/types';
import type { Budget } from '@/features/budgets/types';

export interface Order {
  id_order: string;
  nroOrder: number;
  id_equipment: string;
  id_user?: string | null;
  status: EnumOrderStatus;
  observations?: string | null;
  equipmentPhotoUrl?: string | null;
  dateOfEntry: string;
  estimatedDate?: string | null;
  deliveryDate?: string | null;
  totalCharged?: number | string | null;
  equipment?: Equipment & { client?: Client | null };
  statusHistory?: StatusHistory[];
  failures?: Failure[];
  budget?: Budget | null;
}

export type OrderEquipmentInput =
  | { id_equipment: string }
  | {
      tipo_equipment: EnumEquipmentType;
      brand: string;
      model: string;
      observations?: string | null;
    };

export interface CreateOrderDto {
  id_client: string;
  equipment: OrderEquipmentInput;
  observations?: string | null;
  equipmentPhotoUrl?: string | null;
  estimatedDate?: string | null;
  id_user?: string | null;
  failures: { id_failure_type: string; description: string }[]; // mínimo 1
}

export interface CreateOrderResponse { message: string; order: Order }

// La forma exacta depende de OrderRepository.getStats (no la pasaste)
export type OrderStats = Record<string, number>;

export interface OrdersQuery extends BaseQuery {
  sortBy?: 'dateOfEntry' | 'estimatedDate' | 'deliveryDate' | 'totalCharged' | 'observations' | 'id_equipment';
}
EOF
cat > orders/orders.service.ts <<'EOF'
import { http } from '@/lib/http';
import type { PaginatedResponse } from '@/types/pagination';
import type {
  Order, CreateOrderDto, CreateOrderResponse, OrderStats, OrdersQuery,
} from './types';

const BASE = 'orders';

export const ordersService = {
  getAll: (params: OrdersQuery, signal?: AbortSignal) =>
    http.get<PaginatedResponse<Order>>(BASE, { params, signal }),
  getById: (id: string, signal?: AbortSignal) =>
    http.get<Order>(`${BASE}/${id}`, { signal }),
  getByEquipment: (idEquipment: string, signal?: AbortSignal) =>
    http.get<Order[]>(`${BASE}/ofEquipment/${idEquipment}`, { signal }),
  getStats: (signal?: AbortSignal) =>
    http.get<OrderStats>(`${BASE}/stats`, { signal }),
  create: (data: CreateOrderDto) => http.post<CreateOrderResponse>(BASE, data),
};
EOF

# ───────────────────────── ADDED COSTS ─────────────────────────
cat > addedCosts/types.ts <<'EOF'
import type { BaseQuery } from '@/types/pagination';
import type { EnumTypeAddedCost } from '@/types/types';

export interface AddedCost {
  id_addedCost: string;
  id_budget: string;
  type_addedCost: EnumTypeAddedCost;
  addedCostDescription: string;
  addedCostAmount: number | string;
}

export interface CreateAddedCostDto {
  id_budget: string;
  type_addedCost: EnumTypeAddedCost;
  addedCostDescription: string;
  addedCostAmount: number;
}
export type UpdateAddedCostDto = Partial<Omit<CreateAddedCostDto, 'id_budget'>>;

export interface AddedCostsQuery extends BaseQuery {
  sortBy?: 'addedCostAmount' | 'addedCostDescription' | 'type_addedCost';
}

export interface TotalResponse { total: number }
EOF
cat > addedCosts/addedCosts.service.ts <<'EOF'
import { http } from '@/lib/http';
import type { PaginatedResponse } from '@/types/pagination';
import type {
  AddedCost, CreateAddedCostDto, UpdateAddedCostDto, AddedCostsQuery, TotalResponse,
} from './types';

const BASE = 'added-cost'; // singular, como está en el backend

export const addedCostsService = {
  getAll: (params: AddedCostsQuery, signal?: AbortSignal) =>
    http.get<PaginatedResponse<AddedCost>>(BASE, { params, signal }),
  getById: (id: string, signal?: AbortSignal) =>
    http.get<AddedCost>(`${BASE}/${id}`, { signal }),
  getByBudget: (idBudget: string, signal?: AbortSignal) =>
    http.get<AddedCost[]>(`${BASE}/ofBudget/${idBudget}`, { signal }),
  getTotalByBudget: (idBudget: string, signal?: AbortSignal) =>
    http.get<TotalResponse>(`${BASE}/ofBudget/${idBudget}/total`, { signal }),
  create: (data: CreateAddedCostDto) => http.post<AddedCost>(BASE, data),
  update: (id: string, data: UpdateAddedCostDto) =>
    http.put<AddedCost>(`${BASE}/${id}`, data),
  remove: (id: string) => http.delete<{ message?: string }>(`${BASE}/${id}`),
};
EOF

# ───────────────────────── BUDGETS ─────────────────────────
cat > budgets/types.ts <<'EOF'
import type { BaseQuery } from '@/types/pagination';
import type { EnumBudgetStatus } from '@/types/types';
import type { AddedCost } from '@/features/addedCosts/types';
import type { Payment } from '@/features/payments/types';

export interface Budget {
  id_budget: string;
  nroBudget: number;
  id_order: string;
  laborCost: number | string;
  discount: number | string;
  status: EnumBudgetStatus;
  budgetDate: string;
  clientSuggestion?: string | null;
  estimatedTotal?: number; // lo agrega toJSON() del backend cuando hay relaciones
  addedCosts?: AddedCost[];
  payments?: Payment[];
  order?: unknown; // tipalo con Order si lo necesitás (cuidado con import circular)
}

export interface CreateBudgetDto {
  id_order: string;
  laborCost: number;
  discount?: number;
}

export interface UpdateBudgetDto {
  laborCost?: number;
  discount?: number;
  status?: EnumBudgetStatus;
}

export interface BudgetsQuery extends BaseQuery {
  sortBy?: 'laborCost' | 'estimatedTotal' | 'status';
}

// Respuesta pública del cliente (link por mail)
export type BudgetDecision = 'approved' | 'rejected' | 'suggestion';
export interface BudgetRespondDto {
  decision: BudgetDecision;
  client_suggestion?: string; // obligatorio si decision === 'suggestion'
}
EOF
cat > budgets/budgets.service.ts <<'EOF'
import { http } from '@/lib/http';
import type { PaginatedResponse } from '@/types/pagination';
import type {
  Budget, CreateBudgetDto, UpdateBudgetDto, BudgetsQuery, BudgetRespondDto,
} from './types';

const BASE = 'budgets';

export const budgetsService = {
  getAll: (params: BudgetsQuery, signal?: AbortSignal) =>
    http.get<PaginatedResponse<Budget>>(BASE, { params, signal }),
  getById: (id: string, signal?: AbortSignal) =>
    http.get<Budget>(`${BASE}/${id}`, { signal }),
  getByOrder: (idOrder: string, signal?: AbortSignal) =>
    http.get<Budget>(`${BASE}/ofOrder/${idOrder}`, { signal }),
  create: (data: CreateBudgetDto) => http.post<Budget>(BASE, data),
  update: (id: string, data: UpdateBudgetDto) =>
    http.put<Budget>(`${BASE}/${id}`, data),
  updateByTech: (id: string, data: UpdateBudgetDto) =>
    http.put<Budget>(`${BASE}/modifyBudget/${id}`, data),
  remove: (id: string) => http.delete<unknown>(`${BASE}/${id}`),
  sendEmail: (id: string) =>
    http.post<{ message: string }>(`${BASE}/${id}/send-email`),
};

// Endpoints públicos (sin auth, usan el token del mail)
export const budgetsPublicService = {
  getByToken: (token: string, signal?: AbortSignal) =>
    http.get<Budget>(`${BASE}/public/${token}`, { signal }),
  respond: (token: string, data: BudgetRespondDto) =>
    http.post<{ ok: boolean }>(`${BASE}/public/${token}/respond`, data),
};
EOF

echo "Listo"; cd ../.. && npx tsc --noEmit -p tsconfig.app.json 2>&1 | head -30
