import { NextResponse } from 'next/server';
import { executeQuery, pool } from '@/lib/mysql';

export async function GET() {
  try {
    const orders = await executeQuery<{ order_id: number; patient_name: string; patient_id: number; medicine_name: string; order_date: string; log_date: string }[]>(
      `SELECT o.order_id, p.name AS patient_name, p.patient_id, m.name AS medicine_name, o.order_date, ml.log_date
       FROM Orders o
       JOIN Patient p ON o.patient_id = p.patient_id
       JOIN OrderItems oi ON o.order_id = oi.order_id
       JOIN Medicine m ON oi.medicine_id = m.medicine_id
       LEFT JOIN MedicalLogs ml ON ml.patient_id = p.patient_id
       ORDER BY o.order_date DESC`
    );
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let connection;
  
  try {
    // Parse the request body
    const orderData = await request.json();
    
    // Validate required fields
    if (!orderData.patient_id || !orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: patient_id and items are required' },
        { status: 400 }
      );
    }
    
    // Begin a transaction using environment variables
    const mysql = await import('mysql2/promise');
    
    // Use environment variables or fall back to defaults
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'test2',
      ssl: process.env.DB_SSL === 'true' ? {
        rejectUnauthorized: false
      } : undefined,
    });
    
    try {
      await connection.beginTransaction();
      
      // Insert the order header
      const [orderResult] = await connection.execute(
        'INSERT INTO Orders (patient_id, supplier_id, employee_id, order_date) VALUES (?, ?, ?, NOW())',
        [orderData.patient_id, orderData.supplier_id || 1, orderData.employee_id || 1]
      );
      
      const orderId = (orderResult as any).insertId;
      
      // Insert order items
      for (const item of orderData.items) {
        await connection.execute(
          'INSERT INTO OrderItems (order_id, medicine_id, quantity) VALUES (?, ?, ?)',
          [orderId, item.medicine_id, item.quantity]
        );
        
        // Optional: Update inventory quantity
        if (orderData.updateInventory) {
          await connection.execute(
            'UPDATE Inventory SET quantity = quantity - ? WHERE medicine_id = ? AND quantity >= ?',
            [item.quantity, item.medicine_id, item.quantity]
          );
        }
      }
      
      // Commit the transaction
      await connection.commit();
      
      return NextResponse.json({ 
        success: true, 
        orderId, 
        message: 'Order created successfully' 
      }, { status: 201 });
      
    } catch (transactionError) {
      // Rollback on error
      await connection.rollback();
      throw transactionError;
    } finally {
      // Always close the connection
      await connection.end();
    }
    
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
