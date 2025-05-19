// MySQL connection management for MedInv
// Supports multiple deployment modes: local, planetscale, and demo
import mysql from 'mysql2/promise';
import mysql2 from 'mysql2';
import { executeMemoryQuery, resetDemoDatabase, getDemoTableStructure } from './memory-db';

// Environment variable configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'test2',
  port: parseInt(process.env.DB_PORT || '3306'),
  ssl: process.env.DB_SSL === 'true' ? {
    rejectUnauthorized: false
  } : undefined,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '40'),
  waitForConnections: true,
  queueLimit: 30,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  connectTimeout: 30000,
  idleTimeout: 30000
};

// Determine deployment mode
const deploymentMode = process.env.DEPLOYMENT_MODE || 'local';

// Create connection pool based on deployment mode (only if not in demo mode)
export const pool = deploymentMode !== 'demo' 
  ? (deploymentMode === 'planetscale' && process.env.DATABASE_URL
    ? mysql.createPool({
        uri: process.env.DATABASE_URL,
        connectionLimit: dbConfig.connectionLimit,
        waitForConnections: dbConfig.waitForConnections,
        queueLimit: dbConfig.queueLimit,
        enableKeepAlive: dbConfig.enableKeepAlive,
        keepAliveInitialDelay: dbConfig.keepAliveInitialDelay,
        connectTimeout: dbConfig.connectTimeout,
        idleTimeout: dbConfig.idleTimeout,
        ssl: { rejectUnauthorized: false }
      })
    : mysql.createPool(dbConfig))
  : null; // No pool needed for demo mode

// Connection status monitoring (only for MySQL modes)
let connectionWarningShown = false;
let activeConnections = 0;
const MAX_WARNING_CONNECTIONS = 15;

// Test pool connection on startup with retry mechanism (only for MySQL modes)
async function testConnection(retries = 3, delay = 2000) {
  if (deploymentMode === 'demo') {
    console.log('Running in demo mode with in-memory database.');
    // Reset the demo database to ensure fresh state
    resetDemoDatabase();
    return true;
  }

  for (let i = 0; i < retries; i++) {
    try {
      const conn = await pool.getConnection();
      console.log(`Successfully connected to DB pool (${deploymentMode} mode).`);
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

// Monitor connection count periodically (skip in demo mode)
if (deploymentMode !== 'demo') {
  setInterval(async () => {
    if (!pool) return;
    
    try {
      const [rows] = await pool.query('SHOW STATUS LIKE "Threads_connected"');
      activeConnections = (rows as any)[0]?.Value || 0;
      
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
}

// Initialize connection if not in testing environment
if (process.env.NODE_ENV !== 'test') {
  testConnection().catch(console.error);
}

// Execute a query with unified interface for both MySQL and in-memory database
export async function executeQuery<T>(query: string, params: any[] = []): Promise<T> {
  // If in demo mode, use the in-memory database
  if (deploymentMode === 'demo') {
    return executeMemoryQuery(query, params) as unknown as T;
  }

  // Otherwise use the actual MySQL database
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
    throw error;
  } finally {
    if (connection) connection.release();
  }
}

// For handling DESCRIBE TABLE queries - particularly useful in demo mode
export async function describeTable(tableName: string): Promise<any[]> {
  if (deploymentMode === 'demo') {
    return getDemoTableStructure(tableName);
  }
  
  // For actual MySQL, execute a DESCRIBE query
  return executeQuery(`DESCRIBE ${tableName}`);
}

// Helper function to get current deployment mode - useful for UI indicators
export function getCurrentDeploymentMode(): string {
  return deploymentMode;
}

// Reset the in-memory database (only works in demo mode)
export function resetDemoDatabaseIfNeeded(): void {
  if (deploymentMode === 'demo') {
    resetDemoDatabase();
  }
}