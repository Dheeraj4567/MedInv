import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql';

export async function GET() {
  try {
    // Ultra-simplified query - just check what columns actually exist
    const query = `
      SELECT 
        b.billing_id, 
        b.patient_id, 
        p.name AS patient_name
      FROM Billing b
      JOIN Patient p ON b.patient_id = p.patient_id
      ORDER BY b.billing_id DESC
      LIMIT 10
    `;
    const billingData = await executeQuery(query);

    if (!billingData || billingData.length === 0) {
      return NextResponse.json([]); // Return empty array if no billing records
    }

    // Add placeholder values for missing fields
    const processedData = Array.isArray(billingData) ? billingData.map(record => ({
      ...record,
      date: '2025-05-05', // Today's date as placeholder
      amount: 1000,       // Mock data
      discount_amount: 100, // Mock data 
      total: 900,         // Mock data
      status: 'Pending'   // Mock status
    })) : [];

    return NextResponse.json(processedData);
  } catch (error) {
    console.error('Error fetching billing data:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to fetch billing data', details: errorMessage }, { status: 500 });
  }
}
