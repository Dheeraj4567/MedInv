// filepath: /Users/rajenderrao/Downloads/medical-inventory/lib/models/BaseModel.ts
import { createServerSupabaseClient } from '../supabase';

/**
 * BaseModel class that provides common database operations for models
 */
export default class BaseModel {
  protected tableName: string;
  protected primaryKey: string;
  
  constructor(tableName: string, primaryKey: string = 'id') {
    this.tableName = tableName;
    this.primaryKey = primaryKey;
  }
  
  /**
   * Get the Supabase client
   */
  protected getClient() {
    return createServerSupabaseClient();
  }
  
  /**
   * Find all records in the table
   */
  async findAll(options: { 
    limit?: number; 
    offset?: number; 
    orderBy?: string;
    orderDirection?: 'asc' | 'desc';
    where?: Record<string, any>;
  } = {}) {
    const { 
      limit = 100, 
      offset = 0, 
      orderBy = this.primaryKey, 
      orderDirection = 'asc',
      where = {}
    } = options;
    
    const client = this.getClient();
    let query = client.from(this.tableName).select('*');
    
    // Apply filters
    Object.entries(where).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
    
    // Apply pagination and ordering
    query = query
      .order(orderBy, { ascending: orderDirection === 'asc' })
      .range(offset, offset + limit - 1);
    
    const { data, error } = await query;
    
    if (error) {
      throw new Error(`Error fetching ${this.tableName}: ${error.message}`);
    }
    
    return data;
  }
  
  /**
   * Find a record by its primary key
   */
  async findById(id: string | number) {
    const client = this.getClient();
    const { data, error } = await client
      .from(this.tableName)
      .select('*')
      .eq(this.primaryKey, id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Record not found
      }
      throw new Error(`Error fetching ${this.tableName}: ${error.message}`);
    }
    
    return data;
  }
  
  /**
   * Create a new record
   */
  async create(data: Record<string, any>) {
    const client = this.getClient();
    const { data: result, error } = await client
      .from(this.tableName)
      .insert([data])
      .select();
    
    if (error) {
      throw new Error(`Error creating ${this.tableName}: ${error.message}`);
    }
    
    return result?.[0] || null;
  }
  
  /**
   * Update a record by its primary key
   */
  async update(id: string | number, data: Record<string, any>) {
    const client = this.getClient();
    const { data: result, error } = await client
      .from(this.tableName)
      .update(data)
      .eq(this.primaryKey, id)
      .select();
    
    if (error) {
      throw new Error(`Error updating ${this.tableName}: ${error.message}`);
    }
    
    return result?.[0] || null;
  }
  
  /**
   * Delete a record by its primary key
   */
  async delete(id: string | number) {
    const client = this.getClient();
    const { error } = await client
      .from(this.tableName)
      .delete()
      .eq(this.primaryKey, id);
    
    if (error) {
      throw new Error(`Error deleting ${this.tableName}: ${error.message}`);
    }
    
    return true;
  }
  
  /**
   * Count records in the table
   */
  async count(where: Record<string, any> = {}) {
    const client = this.getClient();
    let query = client.from(this.tableName).select('*', { count: 'exact', head: true });
    
    // Apply filters
    Object.entries(where).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
    
    const { count, error } = await query;
    
    if (error) {
      throw new Error(`Error counting ${this.tableName}: ${error.message}`);
    }
    
    return count || 0;
  }
}