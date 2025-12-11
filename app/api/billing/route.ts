import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql';

export async function GET() {
  try {
    // Query to fetch billing data
    const query = `
      SELECT 
        b.billing_id, 
        b.patient_id, 
        p.name AS patient_name,
        b.billing_date,
        b.total_amount,
        b.payment_status
      FROM Billing b
      JOIN Patient p ON b.patient_id = p.patient_id
      ORDER BY b.billing_id DESC
      LIMIT 10
    `;
    const billingData = await executeQuery<any[]>(query);

    if (!billingData || billingData.length === 0) {
      return NextResponse.json([]); // Return empty array if no billing records
    }

    // Process data to match frontend interface
    const processedData = billingData.map(record => ({
      billing_id: record.billing_id,
      patient_id: record.patient_id,
      patient_name: record.patient_name,
      date: record.billing_date,
      amount: record.total_amount, // Using total as amount for now
      discount_amount: 0, // Placeholder as it's not in the main table
      total: record.total_amount,
      status: record.payment_status
    }));

    return NextResponse.json(processedData);
  } catch (error) {
    console.error('Error fetching billing data:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to fetch billing data', details: errorMessage }, { status: 500 });
  }
}
