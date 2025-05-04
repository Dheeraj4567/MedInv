import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql';

// Define the expected structure of the joined data
interface BillingInfo {
  billing_id: number;
  patient_id: number;
  patient_name: string; // From Patient table
  invoice: string;
  // Add other relevant fields if needed, e.g., billing date, total amount (might require joining BillingDetails and summing)
  // For simplicity, we'll start with basic Billing and Patient info
}

export async function GET() {
  try {
    const query = `
      SELECT 
        b.billing_id, 
        b.patient_id, 
        p.name AS patient_name, 
        b.invoice
      FROM Billing b
      JOIN Patient p ON b.patient_id = p.patient_id
      ORDER BY b.billing_id DESC; 
      -- Consider adding date ordering if a date column exists in Billing
    `;
    const billingData = await executeQuery<BillingInfo[]>(query);

    if (!billingData || billingData.length === 0) {
      return NextResponse.json([]); // Return empty array if no billing records
    }

    // TODO: Enhance query to calculate total amount, discount, status etc. 
    // This might involve joining BillingDetails and potentially Discount tables.
    // For now, we return basic info and will add placeholders/logic in frontend.

    return NextResponse.json(billingData);
  } catch (error) {
    console.error('Error fetching billing data:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to fetch billing data', details: errorMessage }, { status: 500 });
  }
}
