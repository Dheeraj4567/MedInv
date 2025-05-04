import { BaseModel } from './base-model';

export interface InventoryItem extends BaseModel {
  inventory_number: number;
  medicine_id: number;
  medicine_name?: string; // Joined field
  supplier_id: number;
  supplier_name?: string; // Joined field
  batch_number: string;
  quantity: number;
  received_date: string | Date;
  expiry_date: string | Date;
  manufacturing_date?: string | Date;
  location?: string;
  notes?: string;
}

export interface InventoryRequest {
  medicine_id: number;
  supplier_id: number;
  batch_number: string;
  quantity: number;
  received_date: string;
  expiry_date: string;
  manufacturing_date?: string;
  location?: string;
  notes?: string;
}

export interface ExpiryAlert {
  inventory_number: number;
  medicine_name: string;
  batch_number: string;
  quantity: number;
  expiry_date: string | Date;
  days_remaining: number;
  status: 'Expired' | 'Critical' | 'Warning' | 'Normal';
}