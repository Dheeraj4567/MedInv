import { ApiResponse, PaginatedResponse } from '../models';

/**
 * Base API service with common methods for API interactions
 */
export class ApiService {
  /**
   * Generic fetch method that handles common error cases
   */
  protected async fetchApi<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || data.message || 'An unknown error occurred',
        };
      }

      return {
        success: true,
        data: data as T,
      };
    } catch (error) {
      console.error('API request error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      };
    }
  }

  /**
   * GET request helper
   */
  protected async get<T>(url: string, params?: Record<string, string>): Promise<ApiResponse<T>> {
    const queryParams = params
      ? '?' +
        Object.entries(params)
          .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
          .join('&')
      : '';

    return this.fetchApi<T>(`${url}${queryParams}`);
  }

  /**
   * POST request helper
   */
  protected async post<T>(url: string, body: any): Promise<ApiResponse<T>> {
    return this.fetchApi<T>(url, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  /**
   * PUT request helper
   */
  protected async put<T>(url: string, body: any): Promise<ApiResponse<T>> {
    return this.fetchApi<T>(url, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  /**
   * DELETE request helper
   */
  protected async delete<T>(url: string): Promise<ApiResponse<T>> {
    return this.fetchApi<T>(url, {
      method: 'DELETE',
    });
  }
}