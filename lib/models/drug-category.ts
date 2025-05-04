import { BaseModel } from './base-model';

export interface DrugCategory extends BaseModel {
  drug_category_id: number;
  drug_category_name: string;
  common_uses: string | null;
}

// Shape of the request body for creating/updating drug categories
export interface DrugCategoryRequest {
  drug_category_name: string;
  common_uses?: string | null;
}

export interface DrugCategoryWithMedicineCount extends DrugCategory {
  medicine_count: number;
}