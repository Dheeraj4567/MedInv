import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql';

export async function GET() {
  try {
    const drugCategories = await executeQuery<{ drug_category_id: number; drug_category_name: string; common_uses: string }[]>(
      `SELECT drug_category_id, drug_category_name, common_uses FROM DrugCategory ORDER BY drug_category_name ASC`
    );
    return NextResponse.json(drugCategories);
  } catch (error) {
    console.error('Error fetching drug categories:', error);
    return NextResponse.json({ error: 'Failed to fetch drug categories' }, { status: 500 });
  }
}

// Define interface for MySQL result
interface OkPacket {
  affectedRows: number;
  insertId: number;
  warningStatus: number;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { drug_category_name, common_uses } = body;

    if (!drug_category_name) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    const query = `INSERT INTO DrugCategory (drug_category_name, common_uses) VALUES (?, ?)`;
    const params = [drug_category_name, common_uses || null]; // Handle optional common_uses

    const result = await executeQuery<OkPacket>(query, params);

    return NextResponse.json(
      { message: 'Drug category added successfully', drug_category_id: result.insertId },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error adding drug category:', error);
    return NextResponse.json({ error: 'Failed to add drug category' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();
    const { drug_category_name, common_uses } = body;

    if (!id) {
      return NextResponse.json({ error: 'Drug category ID is required' }, { status: 400 });
    }
    if (!drug_category_name) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    const query = `UPDATE DrugCategory SET drug_category_name = ?, common_uses = ? WHERE drug_category_id = ?`;
    const params = [drug_category_name, common_uses || null, id];

    const result = await executeQuery<OkPacket>(query, params);

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Drug category not found or no changes made' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Drug category updated successfully' });

  } catch (error) {
    console.error('Error updating drug category:', error);
    return NextResponse.json({ error: 'Failed to update drug category' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Drug category ID is required' }, { status: 400 });
     }

     // Add check for dependencies (e.g., Medicines using this category)
     const medicineCheck = await executeQuery<any[]>('SELECT 1 FROM Medicine WHERE drug_category_id = ? LIMIT 1', [id]); // Added type annotation
     if (medicineCheck.length > 0) {
        return NextResponse.json({ error: 'Cannot delete category, it is currently assigned to medicines.' }, { status: 409 }); // Conflict
     }

    const query = 'DELETE FROM DrugCategory WHERE drug_category_id = ?';
    const params = [id];

    const result = await executeQuery<OkPacket>(query, params);

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Drug category not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Drug category deleted successfully' });

  } catch (error) {
    console.error('Error deleting drug category:', error);
     let errorMessage = 'Failed to delete drug category';
      if (error instanceof Error && 'code' in error) {
          if ((error as any).code === 'ER_ROW_IS_REFERENCED_2' || (error as any).errno === 1451) { // MySQL error code for FK constraint
              errorMessage = 'Cannot delete category as it is referenced in other records.';
          }
      }
    return NextResponse.json(
       { error: errorMessage, details: error instanceof Error ? error.message : 'Unknown error' },
       { status: 500 }
     );
  }
}
