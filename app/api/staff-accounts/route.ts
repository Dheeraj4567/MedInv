import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql';
import bcrypt from 'bcryptjs';

// Define the expected structure for GET response
interface StaffAccountInfo {
  username: string;
  employee_id: number | null;
  employee_name: string | null;
  role: string | null;
}

// Define interface for MySQL result (used in POST, PUT, DELETE)
interface OkPacket {
  affectedRows: number;
  insertId?: number;
  warningStatus: number;
}

export async function GET() {
  try {
    // Join EmployeeAccounts with Employee to get employee names
    const query = `
      SELECT 
        ea.username,
        ea.employee_id,
        e.name AS employee_name,
        'staff' AS role
      FROM EmployeeAccounts ea
      LEFT JOIN Employee e ON ea.employee_id = e.employee_id
      ORDER BY ea.username ASC
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

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }
    
    if (password.length < 6) {
       return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `INSERT INTO EmployeeAccounts (username, password_hash, employee_id) VALUES (?, ?, ?)`;
    const params = [username, hashedPassword, employee_id || null];

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
    }
    return NextResponse.json({ error: errorMessage, details: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    const body = await request.json();
    const { employee_id } = body;

    if (!username) {
      return NextResponse.json({ error: 'Username is required in query parameters' }, { status: 400 });
    }

    // Build the update query dynamically based on provided fields
    const updateParts = [];
    const updateParams = [];
    
    if (employee_id !== undefined) {
      updateParts.push('employee_id = ?');
      updateParams.push(employee_id);
    }
    
    if (updateParts.length === 0) {
      return NextResponse.json({ error: 'No fields provided for update' }, { status: 400 });
    }
    
    updateParams.push(username); // For the WHERE clause

    const query = `UPDATE EmployeeAccounts SET ${updateParts.join(', ')} WHERE username = ?`;
    const result = await executeQuery<OkPacket>(query, updateParams);

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Staff account not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Staff account updated successfully' });
  } catch (error: any) {
    console.error('Error updating staff account:', error);
    let errorMessage = 'Failed to update staff account';
    if (error.code === 'ER_DUP_ENTRY') {
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

    // Check for admin role before deletion
    const roleCheck = await executeQuery<any[]>('SELECT role FROM EmployeeAccounts WHERE username = ?', [username]);
    if (roleCheck.length > 0 && roleCheck[0].role === 'admin') {
      return NextResponse.json({ error: 'Cannot delete an administrator account.' }, { status: 403 });
    }

    const query = 'DELETE FROM EmployeeAccounts WHERE username = ?';
    const result = await executeQuery<OkPacket>(query, [username]);

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Staff account not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Staff account deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting staff account:', error);
    return NextResponse.json({ error: 'Failed to delete staff account', details: error.message }, { status: 500 });
  }
}
