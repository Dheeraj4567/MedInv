import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql';

// Define the expected structure based on the Employee table schema
interface EmployeeInfo {
  employee_id: number;
  name: string;
  position: string | null;
  department: string | null;
  contact: string | null;
  // Add other relevant fields if needed, e.g., status, email
}

export async function GET() {
  try {
    // Adjust the query based on the actual columns in your Employee table
    const query = `
      SELECT 
        employee_id, 
        name, 
        position, 
        department, 
        contact
        -- Add other columns like status, email here if they exist
      FROM Employee 
      ORDER BY name ASC; 
    `;
    const employeeData = await executeQuery<EmployeeInfo[]>(query);

    if (!employeeData || employeeData.length === 0) {
      return NextResponse.json([]); // Return empty array if no employees
    }

    return NextResponse.json(employeeData);
  } catch (error) {
    console.error('Error fetching employee data:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to fetch employee data', details: errorMessage }, { status: 500 });
  }
}
