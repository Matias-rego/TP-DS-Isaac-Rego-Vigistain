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
  ofRol?: EnumRol;
}
