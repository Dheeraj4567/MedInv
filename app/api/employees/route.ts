import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql';

// Define the expected structure based on the Employee table schema
interface EmployeeInfo {
  employee_id: number;
  name: string;
  role: string;
  email: string;
  phone_number: string | null;
  hire_date: string | null;
}

export async function GET() {
  try {
    // First, let's check what columns actually exist in the Employee table
    // This is a safer approach than guessing
    const checkQuery = `SHOW COLUMNS FROM Employee`;
    const columns = await executeQuery<any[]>(checkQuery);
    const columnNames = columns.map(c => c.Field);
    
    // Build the query dynamically based on available columns
    const hasHireDate = columnNames.includes('hire_date');
    
    const query = `
      SELECT 
        employee_id, 
        name, 
        role, 
        email, 
        phone_number
        ${hasHireDate ? ', hire_date' : ''}
      FROM Employee 
      ORDER BY name ASC; 
    `;
    
    const employeeData = await executeQuery<any[]>(query);

    if (!employeeData || employeeData.length === 0) {
      return NextResponse.json([]); // Return empty array if no employees
    }
    
    // Map to the expected interface, handling missing fields
    const mappedData: EmployeeInfo[] = employeeData.map(emp => ({
      employee_id: emp.employee_id,
      name: emp.name,
      role: emp.role,
      email: emp.email,
      phone_number: emp.phone_number,
      hire_date: hasHireDate ? emp.hire_date : null
    }));

    return NextResponse.json(mappedData);
  } catch (error) {
    console.error('Error fetching employee data:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to fetch employee data', details: errorMessage }, { status: 500 });
  }
}
