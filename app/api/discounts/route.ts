import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql';

// Define the expected structure based on the Discount table schema
interface DiscountInfo {
  discount_id: number;
  billing_id: number; // Foreign key to Billing
  description: string | null;
  start_date: string; // Assuming DATE type in DB
  end_date: string;   // Assuming DATE type in DB
  // Add percentage or amount if it exists in the table
}

export async function GET() {
  try {
    // Adjust the query based on the actual columns in your Discount table
    // You might need to join with Billing or other tables if necessary
    const query = `
      SELECT 
        discount_id, 
        billing_id, 
        description, 
        start_date, 
        end_date
        -- Add other columns like percentage or amount here if they exist
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
