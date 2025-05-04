import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql';

export async function GET() {
  try {
    const medicines = await executeQuery<{ medicine_id: number; name: string; price: number; manufacturer: string; expiry_date: string; drug_category_id: number }[]>(
      `SELECT medicine_id, name, price, manufacturer, expiry_date, drug_category_id FROM Medicine ORDER BY name ASC`
    );
    return NextResponse.json(medicines);
  } catch (error) {
    console.error('Error fetching medicines:', error);
     return NextResponse.json({ error: 'Failed to fetch medicines' }, { status: 500 });
   }
 }

 // Define interface for MySQL result (used in POST)
 interface OkPacket {
   affectedRows: number;
   insertId: number; // This will be the new medicine_id
   warningStatus: number;
 }

 export async function POST(request: Request) {
   try {
     const body = await request.json();
     const { name, price, manufacturer, expiry_date, drug_category_id } = body;

     // Basic validation
     if (!name || price == null || !manufacturer || !expiry_date || !drug_category_id) {
       return NextResponse.json(
         { error: 'Name, price, manufacturer, expiry date, and drug category ID are required' },
         { status: 400 }
       );
     }
     if (isNaN(parseFloat(price)) || parseFloat(price) < 0) {
        return NextResponse.json({ error: 'Price must be a non-negative number' }, { status: 400 });
     }
      if (isNaN(parseInt(drug_category_id))) {
        return NextResponse.json({ error: 'Drug Category ID must be a number' }, { status: 400 });
     }
     // Consider adding date validation for expiry_date

     const query = `
       INSERT INTO Medicine (name, price, manufacturer, expiry_date, drug_category_id)
       VALUES (?, ?, ?, ?, ?)
     `;
     // Ensure price and drug_category_id are passed as numbers
     const params = [name, parseFloat(price), manufacturer, expiry_date, parseInt(drug_category_id)];

     const result = await executeQuery<OkPacket>(query, params);

     return NextResponse.json(
       { message: 'Medicine added successfully', medicine_id: result.insertId },
       { status: 201 }
     );

   } catch (error) {
     console.error('Error adding medicine:', error);
      let errorMessage = 'Failed to add medicine';
     if (error instanceof Error && 'code' in error) {
       if ((error as any).code === 'ER_NO_REFERENCED_ROW_2') {
          errorMessage = 'Invalid Drug Category ID provided.';
       }
     }
     return NextResponse.json(
       {
         error: errorMessage,
         details: error instanceof Error ? error.message : 'Unknown error'
       },
       { status: 500 }
     );
   }
 }

 export async function PUT(request: Request) {
   try {
     const { searchParams } = new URL(request.url);
     const medicine_id = searchParams.get('medicine_id');
     const body = await request.json();
     const { name, price, manufacturer, expiry_date, drug_category_id } = body;

     if (!medicine_id) {
       return NextResponse.json({ error: 'Medicine ID is required' }, { status: 400 });
     }

     // Basic validation for provided fields
     if (price !== undefined && (isNaN(parseFloat(price)) || parseFloat(price) < 0)) {
        return NextResponse.json({ error: 'Price must be a non-negative number' }, { status: 400 });
     }
      if (drug_category_id !== undefined && isNaN(parseInt(drug_category_id))) {
        return NextResponse.json({ error: 'Drug Category ID must be a number' }, { status: 400 });
     }
     // Add more validation as needed (e.g., date format for expiry_date)

     // Build dynamic query
     let query = 'UPDATE Medicine SET ';
     const params = [];
     const fieldsToUpdate = [];

     if (name !== undefined) { fieldsToUpdate.push('name = ?'); params.push(name); }
     if (price !== undefined) { fieldsToUpdate.push('price = ?'); params.push(parseFloat(price)); }
     if (manufacturer !== undefined) { fieldsToUpdate.push('manufacturer = ?'); params.push(manufacturer); }
     if (expiry_date !== undefined) { fieldsToUpdate.push('expiry_date = ?'); params.push(expiry_date); }
     if (drug_category_id !== undefined) { fieldsToUpdate.push('drug_category_id = ?'); params.push(parseInt(drug_category_id)); }

     if (fieldsToUpdate.length === 0) {
         return NextResponse.json({ error: 'No fields provided for update' }, { status: 400 });
     }

     query += fieldsToUpdate.join(', ');
     query += ' WHERE medicine_id = ?';
     params.push(medicine_id);

     const result = await executeQuery<OkPacket>(query, params);

     if (result.affectedRows === 0) {
       return NextResponse.json({ error: 'Medicine not found or no changes made' }, { status: 404 });
     }

     return NextResponse.json({ message: 'Medicine updated successfully' });

   } catch (error) {
     console.error('Error updating medicine:', error);
      let errorMessage = 'Failed to update medicine';
     if (error instanceof Error && 'code' in error) {
       if ((error as any).code === 'ER_NO_REFERENCED_ROW_2') {
          errorMessage = 'Invalid Drug Category ID provided.';
       }
     }
     return NextResponse.json(
       { error: errorMessage, details: error instanceof Error ? error.message : 'Unknown error' },
       { status: 500 }
     );
   }
 }

 export async function DELETE(request: Request) {
   try {
     const { searchParams } = new URL(request.url);
     const medicine_id = searchParams.get('medicine_id');

     if (!medicine_id) {
       return NextResponse.json({ error: 'Medicine ID is required' }, { status: 400 });
     }

     // Check for dependencies (e.g., in Inventory) before deleting?
     // For simplicity, we'll just attempt deletion. Add dependency checks if needed.
     // const inventoryCheck = await executeQuery('SELECT 1 FROM Inventory WHERE medicine_id = ? LIMIT 1', [medicine_id]);
     // if (inventoryCheck.length > 0) {
     //   return NextResponse.json({ error: 'Cannot delete medicine, it exists in inventory.' }, { status: 409 }); // Conflict
     // }


     const query = 'DELETE FROM Medicine WHERE medicine_id = ?';
     const params = [medicine_id];

     const result = await executeQuery<OkPacket>(query, params);

     if (result.affectedRows === 0) {
       return NextResponse.json({ error: 'Medicine not found' }, { status: 404 });
     }

      return NextResponse.json({ message: 'Medicine deleted successfully' });

    } catch (error: any) { // Type error as any
      console.error('Error deleting medicine:', error);
       let errorMessage = 'Failed to delete medicine';
      // Handle foreign key constraint errors if Medicine is referenced elsewhere (e.g., OrderItems)
      if (error instanceof Error && 'code' in error) {
          if ((error as any).code === 'ER_ROW_IS_REFERENCED_2' || (error as any).errno === 1451) { // MySQL error code for FK constraint
              errorMessage = 'Cannot delete medicine as it is referenced in other records (e.g., inventory, orders).';
          }
      }
     return NextResponse.json(
       { error: errorMessage, details: error instanceof Error ? error.message : 'Unknown error' },
       { status: (error.code === 'ER_ROW_IS_REFERENCED_2' || error.errno === 1451) ? 409 : 500 } // Use 409 for FK error
      );
    }
 }
