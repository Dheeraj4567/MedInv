// In-memory database for demo mode
// This allows users to interact with the app without persistent changes

import { v4 as uuidv4 } from 'uuid';

// Demo data storage - resets on page refresh
let memoryDatabase = {
  Patient: [],
  Medicine: [],
  Inventory: [],
  Orders: [],
  OrderItems: [],
  Supplier: [],
  Employee: [],
  MedicalLogs: []
};

// Pre-populated data
const seedDemoData = () => {
  // Pre-populated patients
  memoryDatabase.Patient = [
    { patient_id: 1, name: 'John Doe', email: 'john.doe@example.com', phone_number: '1234567890', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { patient_id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', phone_number: '9876543210', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { patient_id: 3, name: 'Rajesh Kumar', email: 'rajesh@example.com', phone_number: '9876543210', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
  ];

  // Pre-populated suppliers
  memoryDatabase.Supplier = [
    { supplier_id: 1, name: 'MediSupply Inc.', email: 'contact@medisupply.com', phone_number: '1122334455', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { supplier_id: 2, name: 'PharmaWholesale', email: 'info@pharmawholesale.com', phone_number: '5566778899', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
  ];

  // Pre-populated employees
  memoryDatabase.Employee = [
    { employee_id: 1, name: 'Dr. Mike Johnson', email: 'mike.johnson@hospital.com', phone_number: '1231231234', role: 'Doctor', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { employee_id: 2, name: 'Nurse Sarah Williams', email: 'sarah.williams@hospital.com', phone_number: '4564564567', role: 'Nurse', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
  ];

  // Pre-populated medicines
  memoryDatabase.Medicine = [
    { medicine_id: 1, name: 'Paracetamol', description: 'Pain reliever and fever reducer', price: 9.99, unit: 'bottle', expiry_date: '2025-12-31', manufacturer: 'MediCorp', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { medicine_id: 2, name: 'Amoxicillin', description: 'Antibiotic medication', price: 19.99, unit: 'pack', expiry_date: '2025-06-30', manufacturer: 'PharmaCorp', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { medicine_id: 3, name: 'Loratadine', description: 'Antihistamine for allergies', price: 15.50, unit: 'box', expiry_date: '2026-01-15', manufacturer: 'AllergyMeds Inc.', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
  ];

  // Pre-populated inventory
  memoryDatabase.Inventory = [
    { inventory_id: 1, medicine_id: 1, quantity: 100, location: 'Shelf A1', last_updated: new Date().toISOString() },
    { inventory_id: 2, medicine_id: 2, quantity: 50, location: 'Shelf B2', last_updated: new Date().toISOString() },
    { inventory_id: 3, medicine_id: 3, quantity: 75, location: 'Shelf C3', last_updated: new Date().toISOString() }
  ];

  // Pre-populated orders
  memoryDatabase.Orders = [
    { order_id: 1, patient_id: 1, supplier_id: 1, employee_id: 1, order_date: '2025-05-15', created_at: new Date().toISOString() }
  ];

  // Pre-populated order items
  memoryDatabase.OrderItems = [
    { order_id: 1, medicine_id: 1, quantity: 2 }
  ];

  // Pre-populated medical logs
  memoryDatabase.MedicalLogs = [
    { log_id: 1, patient_id: 1, medicine_id: 1, log_date: '2025-05-15', dosage: '1 tablet every 6 hours', notes: 'Patient reported headache relief after first dose', created_at: new Date().toISOString() },
    { log_id: 2, patient_id: 2, medicine_id: 2, log_date: '2025-05-16', dosage: '1 capsule twice daily', notes: 'Treating respiratory infection', created_at: new Date().toISOString() }
  ];
};

// Initialize with seed data
seedDemoData();

// Helper to generate sequential IDs for each table
const getNextId = (tableName) => {
  const items = memoryDatabase[tableName];
  const idField = tableName.toLowerCase().endsWith('s') 
    ? tableName.toLowerCase().slice(0, -1) + '_id' 
    : tableName.toLowerCase() + '_id';
  
  return items.length > 0 
    ? Math.max(...items.map(item => item[idField])) + 1 
    : 1;
};

// Generic query execution for memory database
export async function executeMemoryQuery(query, params = []) {
  // Parse the query to determine operation
  query = query.trim().toLowerCase();
  
  // SELECT queries
  if (query.startsWith('select')) {
    return handleSelect(query, params);
  }
  
  // INSERT queries
  if (query.startsWith('insert')) {
    return handleInsert(query, params);
  }
  
  // UPDATE queries
  if (query.startsWith('update')) {
    return handleUpdate(query, params);
  }
  
  // DELETE queries
  if (query.startsWith('delete')) {
    return handleDelete(query, params);
  }
  
  // For other queries like DESCRIBE, etc.
  return [];
}

// Handle SELECT queries
function handleSelect(query, params) {
  // Extract table name - simplified parsing
  let tableName = '';
  
  if (query.includes('from ')) {
    const fromPart = query.split('from ')[1];
    tableName = fromPart.split(' ')[0].trim();
  }
  
  // Simple join handling using regex for common patterns
  if (query.includes('join')) {
    return handleJoinQuery(query, params);
  }
  
  // Handle COUNT aggregation
  if (query.includes('count(*)')) {
    return handleCountQuery(query, params);
  }
  
  // Handle SUM aggregation
  if (query.includes('sum(')) {
    return handleSumQuery(query, params);
  }
  
  // Simple where clause handling
  if (query.includes('where')) {
    return handleWhereQuery(query, params, tableName);
  }
  
  // Default - return all records from the table
  if (tableName && memoryDatabase[tableName]) {
    return memoryDatabase[tableName].map(item => ({...item}));
  }
  
  return [];
}

// Handle INSERT queries
function handleInsert(query, params) {
  // Extract table name
  const tableMatch = query.match(/insert into (\w+)/i);
  if (!tableMatch || !tableMatch[1]) return { insertId: 0, affectedRows: 0 };
  
  const tableName = tableMatch[1];
  
  // Make sure table exists
  if (!memoryDatabase[tableName]) {
    memoryDatabase[tableName] = [];
  }
  
  // Create new record
  const newId = getNextId(tableName);
  const idField = tableName.toLowerCase().endsWith('s') 
    ? tableName.toLowerCase().slice(0, -1) + '_id' 
    : tableName.toLowerCase() + '_id';
  
  // Create new record with ID
  const newRecord = { [idField]: newId };
  
  // Extract column names from query
  const columnsMatch = query.match(/\(([^)]+)\) values/i);
  if (columnsMatch && columnsMatch[1]) {
    const columns = columnsMatch[1].split(',').map(col => col.trim());
    
    // Assign values from params to corresponding columns
    columns.forEach((col, index) => {
      if (index < params.length) {
        newRecord[col] = params[index];
      }
    });
  }
  
  // Add timestamps if they exist in the schema
  if (tableName !== 'OrderItems') {
    if (!('created_at' in newRecord)) {
      newRecord.created_at = new Date().toISOString();
    }
    if (!('updated_at' in newRecord)) {
      newRecord.updated_at = new Date().toISOString();
    }
  }
  
  // Add to the table
  memoryDatabase[tableName].push(newRecord);
  
  // Return mysql-like result
  return { insertId: newId, affectedRows: 1 };
}

// Handle UPDATE queries
function handleUpdate(query, params) {
  // Extract table name
  const tableMatch = query.match(/update (\w+) set/i);
  if (!tableMatch || !tableMatch[1]) return { affectedRows: 0 };
  
  const tableName = tableMatch[1];
  
  // Make sure table exists
  if (!memoryDatabase[tableName]) {
    return { affectedRows: 0 };
  }
  
  // Extract where condition
  const whereMatch = query.match(/where (.+)$/i);
  if (!whereMatch) {
    return { affectedRows: 0 }; // Safety - don't update all records
  }
  
  const whereCondition = whereMatch[1].trim();
  
  // Extract field and value from where condition (simplified)
  const whereFieldMatch = whereCondition.match(/(\w+)\s*=\s*\?/);
  if (!whereFieldMatch) {
    return { affectedRows: 0 };
  }
  
  const whereField = whereFieldMatch[1];
  const whereValue = params[params.length - 1]; // Last param is the where value
  
  // Extract field=value pairs from SET clause
  const setMatch = query.match(/set (.+) where/i);
  if (!setMatch) {
    return { affectedRows: 0 };
  }
  
  // Find records to update
  let affectedRows = 0;
  memoryDatabase[tableName] = memoryDatabase[tableName].map(record => {
    if (record[whereField] == whereValue) { // Loose comparison for type handling
      affectedRows++;
      
      // Process SET clause (simplified parsing)
      const setParts = setMatch[1].split(',');
      let paramIndex = 0;
      
      setParts.forEach(part => {
        const fieldMatch = part.trim().match(/(\w+)\s*=\s*\?/);
        if (fieldMatch && paramIndex < params.length - 1) {
          const field = fieldMatch[1];
          record[field] = params[paramIndex++];
        }
      });
      
      // Update timestamp if it exists
      if ('updated_at' in record) {
        record.updated_at = new Date().toISOString();
      }
    }
    return record;
  });
  
  return { affectedRows };
}

// Handle DELETE queries
function handleDelete(query, params) {
  // Extract table name
  const tableMatch = query.match(/delete from (\w+)/i);
  if (!tableMatch || !tableMatch[1]) return { affectedRows: 0 };
  
  const tableName = tableMatch[1];
  
  // Make sure table exists
  if (!memoryDatabase[tableName]) {
    return { affectedRows: 0 };
  }
  
  // Extract where condition
  const whereMatch = query.match(/where (.+)$/i);
  if (!whereMatch) {
    return { affectedRows: 0 }; // Safety - don't delete all records
  }
  
  const whereCondition = whereMatch[1].trim();
  
  // Extract field and value from where condition (simplified)
  const whereFieldMatch = whereCondition.match(/(\w+)\s*=\s*\?/);
  if (!whereFieldMatch) {
    return { affectedRows: 0 };
  }
  
  const whereField = whereFieldMatch[1];
  const whereValue = params[0]; // Assume it's the first param
  
  // Count items before deletion
  const beforeCount = memoryDatabase[tableName].length;
  
  // Filter out matching records
  memoryDatabase[tableName] = memoryDatabase[tableName].filter(
    record => record[whereField] != whereValue // Loose comparison
  );
  
  // Calculate affected rows
  return { affectedRows: beforeCount - memoryDatabase[tableName].length };
}

// Handle more complex JOIN queries
function handleJoinQuery(query, params) {
  // This is a simplified JOIN handler that works for the most common queries in MedInv
  // Extract main table and joined tables
  const fromMatch = query.match(/from\s+(\w+)/i);
  if (!fromMatch) return [];
  
  const mainTable = fromMatch[1];
  
  // For orders page JOIN example:
  if (mainTable === 'Orders' && 
      query.includes('join patient') && 
      query.includes('join orderitems') && 
      query.includes('join medicine')) {
    
    // Create joined results manually
    const results = [];
    
    // Process each order
    memoryDatabase.Orders.forEach(order => {
      // Find related patient
      const patient = memoryDatabase.Patient.find(p => p.patient_id === order.patient_id) || {};
      
      // Find related order items
      const orderItems = memoryDatabase.OrderItems.filter(oi => oi.order_id === order.order_id);
      
      // For each order item, create a result row with medicine details
      orderItems.forEach(item => {
        const medicine = memoryDatabase.Medicine.find(m => m.medicine_id === item.medicine_id) || {};
        
        // Find optional medical log (LEFT JOIN)
        const medicalLog = memoryDatabase.MedicalLogs.find(
          ml => ml.patient_id === order.patient_id
        ) || {};
        
        results.push({
          order_id: order.order_id,
          patient_name: patient.name,
          patient_id: patient.patient_id,
          medicine_name: medicine.name,
          order_date: order.order_date,
          log_date: medicalLog.log_date,
          quantity: item.quantity
        });
      });
    });
    
    return results;
  }
  
  // If we don't have a specific handler, return empty array
  return [];
}

// Handle COUNT queries
function handleCountQuery(query, params) {
  const fromMatch = query.match(/from\s+(\w+)/i);
  if (!fromMatch) return [{ count: 0 }];
  
  const tableName = fromMatch[1];
  
  // Check if the table exists
  if (!memoryDatabase[tableName]) return [{ count: 0 }];
  
  // Extract field name for count result
  const countAsMatch = query.match(/count\(\*\)\s+as\s+(\w+)/i);
  const countField = countAsMatch ? countAsMatch[1] : 'count';
  
  // Extract where condition if present
  if (query.includes('where')) {
    const whereMatch = query.match(/where\s+(.+)$/i);
    if (whereMatch) {
      const condition = whereMatch[1].toLowerCase();
      
      // Handle quantity < 10 condition for inventory
      if (condition.includes('quantity') && condition.includes('<')) {
        const threshold = parseInt(condition.split('<')[1].trim(), 10);
        const count = memoryDatabase[tableName].filter(item => item.quantity < threshold).length;
        return [{ [countField]: count }];
      }
      
      // Handle expiry_date between x and y
      if (condition.includes('expiry_date') && condition.includes('between')) {
        // This is simplified and would need proper date handling in a real implementation
        const count = memoryDatabase[tableName].filter(item => {
          const expiryDate = new Date(item.expiry_date);
          const today = new Date();
          const futureDate = new Date();
          futureDate.setDate(today.getDate() + 30);
          
          return expiryDate >= today && expiryDate <= futureDate;
        }).length;
        
        return [{ [countField]: count }];
      }
    }
  }
  
  // Default - count all records
  return [{ [countField]: memoryDatabase[tableName].length }];
}

// Handle SUM queries
function handleSumQuery(query, params) {
  // Extract the field being summed
  const sumMatch = query.match(/sum\((\w+)\)\s+as\s+(\w+)/i);
  if (!sumMatch) return [{ sum: 0 }];
  
  const sumField = sumMatch[1];
  const resultField = sumMatch[2];
  
  // Handle inventory total items query
  if (query.includes('from inventory') && sumField === 'quantity') {
    const sum = memoryDatabase.Inventory.reduce((total, item) => total + item.quantity, 0);
    return [{ [resultField]: sum }];
  }
  
  // Handle total value calculation with join
  if (query.includes('from inventory') && 
      query.includes('join medicine') && 
      query.includes('quantity') && 
      query.includes('price')) {
    
    // Calculate total value
    let totalValue = 0;
    
    memoryDatabase.Inventory.forEach(invItem => {
      const medicine = memoryDatabase.Medicine.find(m => m.medicine_id === invItem.medicine_id);
      if (medicine) {
        totalValue += invItem.quantity * (medicine.price || 0);
      }
    });
    
    return [{ [resultField]: totalValue }];
  }
  
  return [{ [resultField]: 0 }];
}

// Handle WHERE clause queries
function handleWhereQuery(query, params, tableName) {
  if (!memoryDatabase[tableName]) return [];
  
  const whereMatch = query.match(/where\s+(.+)$/i);
  if (!whereMatch) return memoryDatabase[tableName];
  
  const whereCondition = whereMatch[1].toLowerCase();
  
  // Simple WHERE field = ? handling
  const whereFieldMatch = whereCondition.match(/(\w+)\s*=\s*\?/);
  if (whereFieldMatch && params.length > 0) {
    const field = whereFieldMatch[1];
    const value = params[0];
    
    return memoryDatabase[tableName].filter(item => item[field] == value); // Loose comparison
  }
  
  return memoryDatabase[tableName];
}

// Reset the demo database to its initial state
export function resetDemoDatabase() {
  memoryDatabase = {
    Patient: [],
    Medicine: [],
    Inventory: [],
    Orders: [],
    OrderItems: [],
    Supplier: [],
    Employee: [],
    MedicalLogs: []
  };
  seedDemoData();
}

// Get table schema information
export function getDemoTableStructure(tableName) {
  // For DESCRIBE queries, return simplified column metadata
  const tableDefinitions = {
    Patient: [
      { Field: 'patient_id', Type: 'int', Null: 'NO', Key: 'PRI', Default: null, Extra: 'auto_increment' },
      { Field: 'name', Type: 'varchar(255)', Null: 'NO', Key: '', Default: null, Extra: '' },
      { Field: 'email', Type: 'varchar(255)', Null: 'YES', Key: '', Default: null, Extra: '' },
      { Field: 'phone_number', Type: 'varchar(20)', Null: 'YES', Key: '', Default: null, Extra: '' },
      { Field: 'created_at', Type: 'timestamp', Null: 'NO', Key: '', Default: 'CURRENT_TIMESTAMP', Extra: '' },
      { Field: 'updated_at', Type: 'timestamp', Null: 'NO', Key: '', Default: 'CURRENT_TIMESTAMP', Extra: '' }
    ],
    Medicine: [
      { Field: 'medicine_id', Type: 'int', Null: 'NO', Key: 'PRI', Default: null, Extra: 'auto_increment' },
      { Field: 'name', Type: 'varchar(255)', Null: 'NO', Key: '', Default: null, Extra: '' },
      { Field: 'description', Type: 'text', Null: 'YES', Key: '', Default: null, Extra: '' },
      { Field: 'price', Type: 'decimal(10,2)', Null: 'NO', Key: '', Default: '0.00', Extra: '' },
      { Field: 'unit', Type: 'varchar(50)', Null: 'YES', Key: '', Default: null, Extra: '' },
      { Field: 'expiry_date', Type: 'date', Null: 'YES', Key: '', Default: null, Extra: '' },
      { Field: 'manufacturer', Type: 'varchar(255)', Null: 'YES', Key: '', Default: null, Extra: '' },
      { Field: 'created_at', Type: 'timestamp', Null: 'NO', Key: '', Default: 'CURRENT_TIMESTAMP', Extra: '' },
      { Field: 'updated_at', Type: 'timestamp', Null: 'NO', Key: '', Default: 'CURRENT_TIMESTAMP', Extra: '' }
    ],
    Inventory: [
      { Field: 'inventory_id', Type: 'int', Null: 'NO', Key: 'PRI', Default: null, Extra: 'auto_increment' },
      { Field: 'medicine_id', Type: 'int', Null: 'NO', Key: 'MUL', Default: null, Extra: '' },
      { Field: 'quantity', Type: 'int', Null: 'NO', Key: '', Default: '0', Extra: '' },
      { Field: 'location', Type: 'varchar(100)', Null: 'YES', Key: '', Default: null, Extra: '' },
      { Field: 'last_updated', Type: 'timestamp', Null: 'NO', Key: '', Default: 'CURRENT_TIMESTAMP', Extra: '' }
    ],
    Orders: [
      { Field: 'order_id', Type: 'int', Null: 'NO', Key: 'PRI', Default: null, Extra: 'auto_increment' },
      { Field: 'patient_id', Type: 'int', Null: 'NO', Key: 'MUL', Default: null, Extra: '' },
      { Field: 'supplier_id', Type: 'int', Null: 'NO', Key: 'MUL', Default: null, Extra: '' },
      { Field: 'employee_id', Type: 'int', Null: 'NO', Key: 'MUL', Default: null, Extra: '' },
      { Field: 'order_date', Type: 'date', Null: 'NO', Key: '', Default: null, Extra: '' },
      { Field: 'created_at', Type: 'timestamp', Null: 'NO', Key: '', Default: 'CURRENT_TIMESTAMP', Extra: '' }
    ],
    OrderItems: [
      { Field: 'order_id', Type: 'int', Null: 'NO', Key: 'PRI', Default: null, Extra: '' },
      { Field: 'medicine_id', Type: 'int', Null: 'NO', Key: 'PRI', Default: null, Extra: '' },
      { Field: 'quantity', Type: 'int', Null: 'NO', Key: '', Default: null, Extra: '' }
    ]
  };
  
  return tableDefinitions[tableName] || [];
}
