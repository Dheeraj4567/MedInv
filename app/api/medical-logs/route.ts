import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql'; // Import executeQuery

export async function GET() {
  try {
    const medicalLogs = await executeQuery<{ record_id: number; patient_id: number; log_date: string }[]>(
      `SELECT record_id, patient_id, log_date FROM MedicalLogs ORDER BY log_date DESC`
    );
    return NextResponse.json(medicalLogs);
  } catch (error) {
    console.error('Error fetching medical logs:', error);
    return NextResponse.json({ error: 'Failed to fetch medical logs' }, { status: 500 });
  }
}
