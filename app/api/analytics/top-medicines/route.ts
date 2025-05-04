import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql';

interface TopMedicineData {
  medicine_id: number;
  name: string;
  total_quantity_sold: number;
}

export async function GET() {
  try {
    // Query to sum quantities from OrderItems, join with Medicine, group by medicine, order by sum, limit to top 5
    const query = `
      SELECT 
        m.medicine_id, 
        m.name, 
        SUM(oi.quantity) AS total_quantity_sold
      FROM OrderItems oi
      JOIN Medicine m ON oi.medicine_id = m.medicine_id
      GROUP BY m.medicine_id, m.name
      ORDER BY total_quantity_sold DESC
      LIMIT 5; 
    `;

    const topMedicines = await executeQuery<TopMedicineData[]>(query);

    if (!topMedicines) {
      // Return empty array if query fails or returns null/undefined
      return NextResponse.json([]);
    }

    return NextResponse.json(topMedicines);

  } catch (error) {
    console.error('Error fetching top selling medicines:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to fetch top selling medicines', details: errorMessage }, { status: 500 });
  }
}
