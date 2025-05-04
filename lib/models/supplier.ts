import { BaseModel } from './base-model';

export interface Supplier extends BaseModel {
  supplier_id: number;
  name: string;
  address?: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  website?: string;
  status?: 'Active' | 'Inactive';
  notes?: string;
}

export interface SupplierRequest {
  name: string;
  address?: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  website?: string;
  status?: 'Active' | 'Inactive';
  notes?: string;
}

export interface SupplierWithStats extends Supplier {
  total_orders: number;
  last_order_date?: string | Date;
  total_amount?: number;
}