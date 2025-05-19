import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql';

export async function GET() {
  try {
    // Query for total items
    const totalItemsQuery = `SELECT SUM(quantity) as total_items FROM Inventory`;
    const totalItemsResult = await executeQuery<{ total_items: number }[]>(totalItemsQuery);
    const total_items = totalItemsResult?.[0]?.total_items ?? 0;

    // Query for total value - Use COALESCE for price
    const totalValueQuery = `
      SELECT SUM(i.quantity * COALESCE(m.price, 0)) as total_value 
      FROM Inventory i
      JOIN Medicine m ON i.medicine_id = m.medicine_id
    `;
    const totalValueResult = await executeQuery<{ total_value: number }[]>(totalValueQuery);
    const total_value = totalValueResult?.[0]?.total_value ?? 0;

    // Query for low stock count (e.g., quantity < 10)
    const lowStockQuery = `SELECT COUNT(*) as low_stock_count FROM Inventory WHERE quantity < 10`;
    const lowStockResult = await executeQuery<{ low_stock_count: number }[]>(lowStockQuery);
    const low_stock_count = lowStockResult?.[0]?.low_stock_count ?? 0;

    // Query for expiring soon count (e.g., expiring within 30 days)
    const expiringSoonQuery = `
      SELECT COUNT(*) as expiring_soon_count 
      FROM Medicine 
      WHERE expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
    `;
    const expiringSoonResult = await executeQuery<{ expiring_soon_count: number }[]>(expiringSoonQuery);
    const expiring_soon_count = expiringSoonResult?.[0]?.expiring_soon_count ?? 0;

    return NextResponse.json({
      total_items: Number(total_items), // Ensure number type
      total_value: Number(total_value), // Ensure number type
      low_stock_count: Number(low_stock_count), // Ensure number type
      expiring_soon_count: Number(expiring_soon_count) // Ensure number type
    });

  } catch (error) {
    console.error('Error fetching inventory summary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory summary' },
      { status: 500 }
    );
  }
}