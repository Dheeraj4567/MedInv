import { BaseModel } from './base-model';
import { DrugCategory } from './drug-category';

export interface Medicine extends BaseModel {
  medicine_id: number;
  name: string;
  price: number;
  manufacturer: string;
  expiry_date: string | Date;
  drug_category_id: number;
  description?: string;
  side_effects?: string;
  dosage_instructions?: string;
  stock?: number;
  unit?: string;
}

// Shape for medicine with category details
export interface MedicineWithCategory extends Medicine {
  category_name: string;
}

// Shape for medicine request (create/update)
export interface MedicineRequest {
  name: string;
  price: number;
  manufacturer: string;
  expiry_date: string;
  drug_category_id: number;
  description?: string;
  side_effects?: string;
  dosage_instructions?: string;
  stock?: number;
  unit?: string;
}

// Medicine with inventory statistics
export interface MedicineWithInventory extends Medicine {
  total_quantity: number;
  batches_count: number;
  nearest_expiry?: string | Date;
}