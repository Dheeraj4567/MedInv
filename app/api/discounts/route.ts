import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql';

// Define the expected structure based on the Discount table schema
interface DiscountInfo {
  discount_id: number;
  name: string;
  description: string | null;
  discount_percent: number;
  start_date: string;
  end_date: string;
  active: number; // MySQL BOOLEAN is TINYINT(1)
}

export async function GET() {
  try {
    const query = `
      SELECT 
        discount_id, 
        name,
        description, 
        discount_percent,
        start_date, 
        end_date,
        active
      FROM Discount 
      ORDER BY start_date DESC; 
    `;
    const discountData = await executeQuery<DiscountInfo[]>(query);

    if (!discountData || discountData.length === 0) {
      return NextResponse.json([]); // Return empty array if no discounts
    }

    return NextResponse.json(discountData);
  } catch (error) {
    console.error('Error fetching discount data:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to fetch discount data', details: errorMessage }, { status: 500 });
  }
}
