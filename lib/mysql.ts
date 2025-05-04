// MySQL connection module for server-side operations
import mysql from 'mysql2/promise';
import mysql2 from 'mysql2';

// Create a connection pool to the MySQL database with improved settings
export const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '', // Ensure this is correct or use environment variables
  database: 'test2',
  waitForConnections: true,
  connectionLimit: 20, // Increased from 10 for better handling
  queueLimit: 30, // Added queue limit to prevent excessive queueing
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  connectTimeout: 30000,
  // Close idle connections after 30 seconds
  idleTimeout: 30000
});

// Connection status monitoring
let connectionWarningShown = false;
let activeConnections = 0;
const MAX_WARNING_CONNECTIONS = 15;

// Test pool connection on startup with retry mechanism
async function testConnection(retries = 3, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      const conn = await pool.getConnection();
      console.log('Successfully connected to DB pool.');
      conn.release();
      return true;
    } catch (err) {
      console.error(`Connection attempt ${i + 1} failed:`, err);
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  return false;
}

// Monitor connection count periodically
setInterval(async () => {
  try {
    const [rows] = await pool.query('SHOW STATUS LIKE "Threads_connected"');
    activeConnections = (rows as any)[0].Value;
    
    if (activeConnections > MAX_WARNING_CONNECTIONS && !connectionWarningShown) {
      console.warn(`⚠️ High connection count: ${activeConnections}/${pool.config.connectionLimit}`);
      connectionWarningShown = true;
    } else if (activeConnections <= MAX_WARNING_CONNECTIONS) {
      connectionWarningShown = false;
    }
  } catch (error) {
    // Silently handle monitoring errors
  }
}, 60000); // Check every minute

testConnection().catch(console.error);

// Execute a query with properly managed connections
export async function executeQuery<T>(query: string, params: any[] = []): Promise<T> {
  let connection;
  try {
    // Explicitly get a connection from the pool
    connection = await pool.getConnection();
    
    // Execute the query
    const [rows] = await connection.execute(query, params);
    return rows as T;
  } catch (error) {
    console.error('Database query error:', {
      error,
      query,
      params,
      timestamp: new Date().toISOString()
    });
    
    // Enhance error message for common SQL errors
    if (error instanceof Error) {
      if ('code' in error) {
        const errCode = (error as any).code;
        switch (errCode) {
          case 'ER_NO_SUCH_TABLE':
            throw new Error('Table not found in database');
          case 'ER_BAD_FIELD_ERROR':
            throw new Error('Invalid column name in query');
          case 'ER_ACCESS_DENIED_ERROR':
            throw new Error('Database access denied');
          case 'ER_CON_COUNT_ERROR':
            throw new Error('Database connection limit reached. Please try again later.');
          default:
            throw error;
        }
      }
    }
    throw error;
  } finally {
    // Always release the connection back to the pool, even if an error occurred
    if (connection) connection.release();
  }
}

// Get all records from a table with pagination support
export async function getAll(table: string, limit = 100, offset = 0): Promise<any[]> {
  return executeQuery<any[]>(`SELECT * FROM ${table} LIMIT ? OFFSET ?`, [limit, offset]);
}

// Get a record by ID
export async function getById(table: string, id: string | number, idField: string = 'id'): Promise<any> {
  const [record] = await executeQuery<any[]>(`SELECT * FROM ${table} WHERE ${idField} = ?`, [id]);
  return record;
}

// Insert a record with connection management
export async function insert(table: string, data: Record<string, any>): Promise<any> {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const placeholders = keys.map(() => '?').join(', ');
  const columns = keys.join(', ');
  
  const query = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;
  
  let connection;
  try {
    connection = await pool.getConnection();
    const [result] = await connection.execute(query, values);
    return result;
  } finally {
    if (connection) connection.release();
  }
}

// Update a record with connection management
export async function update(table: string, id: string | number, data: Record<string, any>, idField: string = 'id'): Promise<any> {
  const keys = Object.keys(data);
  const values = Object.values(data);
  
  const setClause = keys.map(key => `${key} = ?`).join(', ');
  const query = `UPDATE ${table} SET ${setClause} WHERE ${idField} = ?`;
  
  let connection;
  try {
    connection = await pool.getConnection();
    const [result] = await connection.execute(query, [...values, id]);
    return result;
  } finally {
    if (connection) connection.release();
  }
}

// Delete a record with connection management
export async function remove(table: string, id: string | number, idField: string = 'id'): Promise<any> {
  const query = `DELETE FROM ${table} WHERE ${idField} = ?`;
  
  let connection;
  try {
    connection = await pool.getConnection();
    const [result] = await connection.execute(query, [id]);
    return result;
  } finally {
    if (connection) connection.release();
  }
}

// Execute raw SQL with connection management
export async function executeRawQuery<T>(sql: string, params: any[] = []): Promise<T> {
  return executeQuery<T>(sql, params);
}

// Force release all connections in emergency situations
export async function closeAllConnections(): Promise<void> {
  try {
    await pool.end();
    console.log('All database connections closed');
  } catch (error) {
    console.error('Error closing database connections:', error);
  }
}
