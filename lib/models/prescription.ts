import { BaseModel } from './base-model';

export interface Prescription extends BaseModel {
  prescription_id: number;
  patient_id: number;
  patient_name?: string; // Joined field
  doctor_name: string;
  prescription_date: string | Date;
  diagnosis?: string;
  status: 'Pending' | 'Filled' | 'Partially Filled' | 'Cancelled';
  notes?: string;
  document_id?: string; // Optional reference to scanned document
}

export interface PrescriptionItem extends BaseModel {
  prescription_item_id: number;
  prescription_id: number;
  medicine_id: number;
  medicine_name?: string; // Joined field
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  instructions?: string;
  dispensed: boolean;
  dispensed_date?: string | Date;
  dispensed_by?: string; // Staff member who dispensed
}

export interface PrescriptionRequest {
  patient_id: number;
  doctor_name: string;
  prescription_date: string;
  diagnosis?: string;
  status?: 'Pending' | 'Filled' | 'Partially Filled' | 'Cancelled';
  notes?: string;
  document_id?: string;
  items: PrescriptionItemRequest[];
}

export interface PrescriptionItemRequest {
  medicine_id: number;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  instructions?: string;
}

export interface PrescriptionWithItems extends Prescription {
  items: PrescriptionItem[];
}

export interface PrescriptionInfo {
  prescription_id: number;
  patient_id: number;
  patient_name: string;
  document_id: string | null;
  medicine_count: number;
  doctor?: string;
  date?: string;
  status?: 'Filled' | 'Pending' | 'Unknown';
}