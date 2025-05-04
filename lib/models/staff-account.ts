import { BaseModel } from './base-model';

export interface StaffAccount extends BaseModel {
  username: string;
  employee_id: number | null;
  employee_name: string | null;
  role: string | null;
  permissions?: string[];
  last_login?: string | Date;
  status?: 'Active' | 'Inactive' | 'Suspended';
  email?: string;
}

export interface StaffAccountRequest {
  username: string;
  password: string;
  employee_id?: number | null;
  role?: string;
  permissions?: string[];
  status?: 'Active' | 'Inactive' | 'Suspended';
  email?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: StaffAccount;
  error?: string;
}