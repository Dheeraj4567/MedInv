import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql';

// Simplified: Calculate Total Quantity Sold Per Month
interface MonthlyQuantitySold {
  month: string; // Format like 'YYYY-MM'
  total_quantity_sold: number;
}

export async function GET() {
  try {
    // Query to sum quantities from OrderItems, grouped by month of the order date
    // Adjust the date formatting and grouping based on your SQL dialect (e.g., DATE_FORMAT for MySQL)
    const query = `
      SELECT 
        DATE_FORMAT(o.order_date, '%Y-%m') AS month, 
        SUM(oi.quantity) AS total_quantity_sold
      FROM OrderItems oi
      JOIN Orders o ON oi.order_id = o.order_id
      WHERE o.order_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH) -- Look at last 6 months
      GROUP BY DATE_FORMAT(o.order_date, '%Y-%m')
      ORDER BY month ASC; 
    `;

    const monthlySales = await executeQuery<MonthlyQuantitySold[]>(query);

    if (!monthlySales) {
      return NextResponse.json([]);
    }

    // Ensure the result has the correct numeric type for quantity
    const formattedData = monthlySales.map(item => ({
        ...item,
        total_quantity_sold: Number(item.total_quantity_sold) || 0
    }));


    return NextResponse.json(formattedData);

  } catch (error) {
    console.error('Error fetching monthly quantity sold:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to fetch monthly quantity sold', details: errorMessage }, { status: 500 });
  }
}
