import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql';

interface SummaryCounts {
  totalMedicines: number;
  totalSuppliers: number;
  totalPatients: number;
  expiringSoonCount: number;
}

export async function GET() {
  try {
    // Execute multiple count queries in parallel
    const [
      medicinesResult,
      suppliersResult,
      patientsResult,
      expiryResult
    ] = await Promise.all([
      executeQuery<{ 'COUNT(*)': number }[]>(`SELECT COUNT(*) FROM Medicine`),
      executeQuery<{ 'COUNT(*)': number }[]>(`SELECT COUNT(*) FROM Supplier`),
      executeQuery<{ 'COUNT(*)': number }[]>(`SELECT COUNT(*) FROM Patient`),
      executeQuery<{ 'COUNT(*)': number }[]>(`SELECT COUNT(*) FROM ExpiryAlert WHERE expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 90 DAY)`)
    ]);

    // Extract counts, defaulting to 0 if query fails or returns unexpected format
    const summary: SummaryCounts = {
      totalMedicines: medicinesResult?.[0]?.['COUNT(*)'] ?? 0,
      totalSuppliers: suppliersResult?.[0]?.['COUNT(*)'] ?? 0,
      totalPatients: patientsResult?.[0]?.['COUNT(*)'] ?? 0,
      expiringSoonCount: expiryResult?.[0]?.['COUNT(*)'] ?? 0,
    };

    return NextResponse.json(summary);

  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to fetch dashboard summary', details: errorMessage }, { status: 500 });
  }
}
