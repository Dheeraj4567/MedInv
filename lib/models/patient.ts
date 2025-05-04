import { BaseModel } from './base-model';

export interface Patient extends BaseModel {
  patient_id: number;
  name: string;
  gender?: 'Male' | 'Female' | 'Other';
  date_of_birth?: string | Date;
  address?: string;
  phone?: string;
  email?: string;
  medical_history?: string;
  allergies?: string;
  registration_date: string | Date;
}

export interface PatientRequest {
  name: string;
  gender?: 'Male' | 'Female' | 'Other';
  date_of_birth?: string;
  address?: string;
  phone?: string;
  email?: string;
  medical_history?: string;
  allergies?: string;
  registration_date?: string;
}

export interface PatientWithStats extends Patient {
  visit_count: number;
  last_visit?: string | Date;
  total_prescriptions: number;
}