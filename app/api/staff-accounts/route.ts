import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql';
import bcrypt from 'bcryptjs'; // Import bcryptjs

// Define the expected structure for GET response
interface StaffAccountInfo {
  username: string;
  employee_id: number | null;
  employee_name: string | null; // From Employee table
  role: string | null; // Position from Employee table
}

// Define interface for MySQL result (used in POST, PUT, DELETE)
interface OkPacket {
  affectedRows: number;
  insertId?: number; // insertId is optional, not present in UPDATE/DELETE
  warningStatus: number;
}

export async function GET() {
  try {
    const query = `
      SELECT
        sa.username,
        sa.employee_id,
        e.name AS employee_name,
        e.position AS role
      FROM StaffAccount sa
      LEFT JOIN Employee e ON sa.employee_id = e.employee_id
      ORDER BY sa.username ASC;
    `;
    const accountData = await executeQuery<StaffAccountInfo[]>(query);

    if (!accountData) {
      return NextResponse.json([]);
    }
    return NextResponse.json(accountData);
  } catch (error) {
    console.error('Error fetching staff account data:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to fetch staff account data', details: errorMessage }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password, employee_id } = body;

    if (!username || !password || !employee_id) {
      return NextResponse.json({ error: 'Username, password, and employee ID are required' }, { status: 400 });
    }
    if (password.length < 6) {
       return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 });
    }
     if (isNaN(parseInt(employee_id))) {
        return NextResponse.json({ error: 'Employee ID must be a number' }, { status: 400 });
     }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if employee exists and is not already linked
    const employeeCheck = await executeQuery<any[]>('SELECT 1 FROM Employee WHERE employee_id = ?', [employee_id]);
    if (employeeCheck.length === 0) {
        return NextResponse.json({ error: 'Invalid Employee ID provided.' }, { status: 400 });
    }
    const accountLinkCheck = await executeQuery<any[]>('SELECT 1 FROM StaffAccount WHERE employee_id = ?', [employee_id]);
     if (accountLinkCheck.length > 0) {
         return NextResponse.json({ error: 'This employee is already linked to another account.' }, { status: 409 }); // Conflict
     }

    const query = `INSERT INTO StaffAccount (username, password_hash, employee_id) VALUES (?, ?, ?)`;
    const params = [username, hashedPassword, employee_id];

    await executeQuery<OkPacket>(query, params);

    return NextResponse.json(
      { message: 'Staff account created successfully' },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Error creating staff account:', error);
    let errorMessage = 'Failed to create staff account';
     if (error.code === 'ER_DUP_ENTRY') {
       errorMessage = 'Username already exists.';
     } else if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        errorMessage = 'Invalid Employee ID provided.';
     }
    return NextResponse.json({ error: errorMessage, details: error.message }, { status: 500 });
  }
}

// Allow updating the linked employee_id
export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    const body = await request.json();
    const { employee_id } = body; // Only allow changing employee link

    if (!username) {
      return NextResponse.json({ error: 'Username is required in query parameters' }, { status: 400 });
    }
    // Allow unlinking by setting employee_id to null
    if (employee_id === undefined) {
       return NextResponse.json({ error: 'Employee ID (or null) is required in request body' }, { status: 400 });
    }
     if (employee_id !== null && isNaN(parseInt(employee_id))) {
        return NextResponse.json({ error: 'Employee ID must be a number or null' }, { status: 400 });
     }

     // Check if new employee exists (if not null)
     if (employee_id !== null) {
         const employeeCheck = await executeQuery<any[]>('SELECT 1 FROM Employee WHERE employee_id = ?', [employee_id]);
         if (employeeCheck.length === 0) {
             return NextResponse.json({ error: 'Invalid new Employee ID provided.' }, { status: 400 });
         }
          // Check if the new employee is already linked to another account (excluding the current one being updated)
          const accountLinkCheck = await executeQuery<any[]>('SELECT 1 FROM StaffAccount WHERE employee_id = ? AND username != ?', [employee_id, username]);
          if (accountLinkCheck.length > 0) {
              return NextResponse.json({ error: 'This employee is already linked to another account.' }, { status: 409 }); // Conflict
          }
     }

    const query = `UPDATE StaffAccount SET employee_id = ? WHERE username = ?`;
    const params = [employee_id, username];

    const result = await executeQuery<OkPacket>(query, params);

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Staff account not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Staff account updated successfully' });

  } catch (error: any) {
    console.error('Error updating staff account:', error);
     let errorMessage = 'Failed to update staff account';
      if (error.code === 'ER_NO_REFERENCED_ROW_2') {
         errorMessage = 'Invalid Employee ID provided.';
      } else if (error.code === 'ER_DUP_ENTRY') {
          errorMessage = 'Update failed due to duplicate entry constraint.';
      }
    return NextResponse.json({ error: errorMessage, details: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    // Add checks here if deleting certain accounts should be prevented (e.g., admin)
    // if (username === 'admin') {
    //   return NextResponse.json({ error: 'Cannot delete the primary admin account.' }, { status: 403 });
    // }

    const query = 'DELETE FROM StaffAccount WHERE username = ?';
    const params = [username];

    const result = await executeQuery<OkPacket>(query, params);

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Staff account not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Staff account deleted successfully' });

  } catch (error: any) {
    console.error('Error deleting staff account:', error);
    // Handle potential foreign key errors if StaffAccount is referenced elsewhere
    return NextResponse.json({ error: 'Failed to delete staff account', details: error.message }, { status: 500 });
  }
}
