import { BaseModel } from './base-model';

export interface Order extends BaseModel {
  order_id: number;
  supplier_id: number;
  supplier_name?: string; // Joined field
  order_date: string | Date;
  delivery_date?: string | Date;
  status: 'Pending' | 'Processing' | 'Completed' | 'Cancelled';
  total_amount: number;
  payment_status: 'Unpaid' | 'Partially Paid' | 'Paid';
  notes?: string;
  created_by?: number | string; // Staff account ID
}

export interface OrderItem extends BaseModel {
  order_item_id: number;
  order_id: number;
  medicine_id: number;
  medicine_name?: string; // Joined field
  quantity: number;
  unit_price: number;
  discount?: number;
  subtotal: number;
}

export interface OrderRequest {
  supplier_id: number;
  order_date: string;
  delivery_date?: string;
  status: 'Pending' | 'Processing' | 'Completed' | 'Cancelled';
  total_amount: number;
  payment_status: 'Unpaid' | 'Partially Paid' | 'Paid';
  notes?: string;
  items: OrderItemRequest[];
}

export interface OrderItemRequest {
  medicine_id: number;
  quantity: number;
  unit_price: number;
  discount?: number;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
}