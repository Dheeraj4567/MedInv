// Base model interface that all models will extend
export interface BaseModel {
  id: number | string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

// Response interfaces for API operations
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}