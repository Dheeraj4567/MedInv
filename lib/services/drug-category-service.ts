import { ApiService } from './api-service';
import { 
  ApiResponse, 
  DrugCategory, 
  DrugCategoryRequest, 
  DrugCategoryWithMedicineCount 
} from '../models';

/**
 * Service for handling Drug Category operations
 */
export class DrugCategoryService extends ApiService {
  private baseUrl = '/api/drug-categories';

  /**
   * Get all drug categories
   */
  async getAllCategories(): Promise<ApiResponse<DrugCategory[]>> {
    return this.get<DrugCategory[]>(this.baseUrl);
  }

  /**
   * Get a drug category by ID
   */
  async getCategoryById(id: number): Promise<ApiResponse<DrugCategory>> {
    return this.get<DrugCategory>(`${this.baseUrl}/${id}`);
  }

  /**
   * Get categories with medicine count
   */
  async getCategoriesWithMedicineCount(): Promise<ApiResponse<DrugCategoryWithMedicineCount[]>> {
    return this.get<DrugCategoryWithMedicineCount[]>(`${this.baseUrl}?includeMedicineCount=true`);
  }

  /**
   * Create a new drug category
   */
  async createCategory(category: DrugCategoryRequest): Promise<ApiResponse<DrugCategory>> {
    return this.post<DrugCategory>(this.baseUrl, category);
  }

  /**
   * Update a drug category
   */
  async updateCategory(id: number, category: DrugCategoryRequest): Promise<ApiResponse<DrugCategory>> {
    return this.put<DrugCategory>(`${this.baseUrl}/${id}`, category);
  }

  /**
   * Delete a drug category
   */
  async deleteCategory(id: number): Promise<ApiResponse<{ success: boolean }>> {
    return this.delete<{ success: boolean }>(`${this.baseUrl}/${id}`);
  }
}