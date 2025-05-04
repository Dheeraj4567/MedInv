import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql';

// Define the expected structure
interface PrescriptionInfo {
  prescription_id: number;
  patient_id: number;
  patient_name: string; // From Patient table
  document_id: string | null; // Assuming this is like a reference ID
  medicine_count: number; // Count of medicines in the prescription
  // Add other relevant fields if needed, e.g., doctor_name (if available), date, status
}

export async function GET() {
  try {
    // This query joins Prescription with Patient and counts items from PrescriptionDetails
    const query = `
      SELECT 
        p.prescription_id, 
        p.patient_id, 
        pt.name AS patient_name, 
        p.document_id,
        COUNT(pd.medicine_id) AS medicine_count
        -- Add other columns like doctor_name, date, status here if they exist in Prescription table
      FROM Prescription p
      JOIN Patient pt ON p.patient_id = pt.patient_id
      LEFT JOIN PrescriptionDetails pd ON p.prescription_id = pd.prescription_id
      GROUP BY p.prescription_id, pt.name, p.document_id -- Group by main prescription info
      ORDER BY p.prescription_id DESC; 
      -- Consider adding date ordering if a date column exists
    `;
    const prescriptionData = await executeQuery<PrescriptionInfo[]>(query);

    if (!prescriptionData || prescriptionData.length === 0) {
      return NextResponse.json([]); // Return empty array if no prescriptions
    }

    return NextResponse.json(prescriptionData);
  } catch (error) {
    console.error('Error fetching prescription data:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to fetch prescription data', details: errorMessage }, { status: 500 });
  }
}
