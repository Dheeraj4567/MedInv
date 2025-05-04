import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql';

// Define interface for MySQL result
interface OkPacket {
  affectedRows: number;
  insertId: number;
  warningStatus: number;
}

export async function GET() {
  try {
    const suppliers = await executeQuery<{ supplier_id: number; name: string; contact_info: string }[]>(
      `SELECT supplier_id, name, contact_info FROM Supplier ORDER BY name ASC`
    );
    return NextResponse.json(suppliers);
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    return NextResponse.json({ error: 'Failed to fetch suppliers' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (!body.name || !body.contact_info) {
      return NextResponse.json(
        { error: 'Name and contact info are required' },
        { status: 400 }
      );
    }
    
    const result = await executeQuery<OkPacket>(
      `INSERT INTO Supplier (name, contact_info) VALUES (?, ?)`,
      [body.name, body.contact_info]
    );
    
    return NextResponse.json(
      { message: 'Supplier created successfully', id: result.insertId },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating supplier:', error);
    return NextResponse.json(
      { error: 'Failed to create supplier' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Supplier ID is required' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const result = await executeQuery<OkPacket>(
      `UPDATE Supplier SET name = ?, contact_info = ? WHERE supplier_id = ?`,
      [body.name, body.contact_info, id]
    );
    
    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Supplier not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { message: 'Supplier updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating supplier:', error);
    return NextResponse.json(
      { error: 'Failed to update supplier' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Supplier ID is required' },
        { status: 400 }
      );
    }
    
    const result = await executeQuery<OkPacket>(
      `DELETE FROM Supplier WHERE supplier_id = ?`,
      [id]
    );
    
    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Supplier not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { message: 'Supplier deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting supplier:', error);
    return NextResponse.json(
      { error: 'Failed to delete supplier' },
      { status: 500 }
    );
  }
}
