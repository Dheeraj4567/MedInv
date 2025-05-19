import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql';

// Define interface for MySQL result
interface OkPacket {
  insertId?: number; // Optional: only present on INSERT
  affectedRows: number;
  warningStatus: number;
}

export async function GET() {
  try {
    const patients = await executeQuery<{ patient_id: number; name: string; email: string | null; phone_number: string | null }[]>(
      `SELECT patient_id, name, email, phone_number FROM Patient ORDER BY name ASC`
    );
    return NextResponse.json(patients);
  } catch (error) {
    console.error('Error fetching patients:', error);
    return NextResponse.json({ error: 'Failed to fetch patients', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone_number } = body; // Include optional fields

    if (!name) {
      return NextResponse.json({ error: 'Patient name is required' }, { status: 400 });
    }

    const query = `INSERT INTO Patient (name, email, phone_number) VALUES (?, ?, ?)`;
    const params = [name, email || null, phone_number || null]; // Use null for missing optional fields

    const result = await executeQuery<OkPacket>(query, params);

    return NextResponse.json(
      { message: 'Patient created successfully', patient_id: result.insertId }, // Return patient_id
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating patient:', error);
    // Handle specific SQL errors
    let errorMessage = 'Failed to create patient';
    if (error instanceof Error) {
      if ('code' in error && (error as any).code === 'ER_NO_DEFAULT_FOR_FIELD') {
        errorMessage = 'Database error: patient_id field needs AUTO_INCREMENT. Please update your database schema.';
      } else if ('code' in error && (error as any).code === 'ER_DUP_ENTRY') {
        errorMessage = 'A patient with these details already exists.';
      }
    }
    return NextResponse.json({
      error: errorMessage,
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id'); // Get id from query param

    if (!id) {
      return NextResponse.json({ error: 'Patient ID is required in query parameters' }, { status: 400 });
    }

    const body = await request.json();
    const { name, email, phone_number } = body; // Include optional fields

    // Basic validation
    if (!name) {
        return NextResponse.json({ error: 'Patient name is required' }, { status: 400 });
    }

    // Build query dynamically (optional: only update provided fields, but simpler to update all)
    const query = `UPDATE Patient SET name = ?, email = ?, phone_number = ? WHERE patient_id = ?`; // Correct column name
    const params = [name, email || null, phone_number || null, id];

    const result = await executeQuery<OkPacket>(query, params);

     if (result.affectedRows === 0) {
       return NextResponse.json({ error: 'Patient not found or no changes made' }, { status: 404 });
     }

    return NextResponse.json({ message: 'Patient updated successfully' }, { status: 200 });

  } catch (error) {
    console.error('Error updating patient:', error);
    return NextResponse.json({ error: 'Failed to update patient', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id'); // Get id from query param

    if (!id) {
      return NextResponse.json({ error: 'Patient ID is required' }, { status: 400 });
    }

    const query = `DELETE FROM Patient WHERE patient_id = ?`; // Correct column name
    const params = [id];

    const result = await executeQuery<OkPacket>(query, params);

     if (result.affectedRows === 0) {
       return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
     }

    return NextResponse.json({ message: 'Patient deleted successfully' }, { status: 200 });

  } catch (error: any) { // Type as any to check error code
    console.error('Error deleting patient:', error);
     let errorMessage = 'Failed to delete patient';
     let status = 500;
      // Handle foreign key constraint errors if Patient is referenced elsewhere
      if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.errno === 1451) {
          errorMessage = 'Cannot delete patient, they are referenced in other records (e.g., Orders).';
          status = 409; // Conflict status
      }
    return NextResponse.json({ error: errorMessage, details: error instanceof Error ? error.message : 'Unknown error' }, { status: status });
  }
}
