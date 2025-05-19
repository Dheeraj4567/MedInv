import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql';

interface InventoryItem {
  inventory_number: number;
  medicine_id: number;
  medicine_name: string;
  supplier_id: number;
  supplier_name: string;
  quantity: number;
}

export async function GET() {
  try {
    const query = `
      SELECT 
        i.inventory_number,
        i.medicine_id,
        m.name as medicine_name,
        i.supplier_id,
        s.name as supplier_name,
        i.quantity
      FROM Inventory i
      LEFT JOIN Medicine m ON i.medicine_id = m.medicine_id
      LEFT JOIN Supplier s ON i.supplier_id = s.supplier_id
      ORDER BY i.inventory_number ASC
    `;

    const inventory = await executeQuery<InventoryItem[]>(query);

    if (!inventory) {
      return NextResponse.json([], { status: 200 });
    }

    return NextResponse.json(inventory);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch inventory',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
     { status: 500 }
     );
   }
 }

 // Define interface for MySQL result (used in POST)
 interface OkPacket {
   affectedRows: number;
   insertId: number; // This will be the new inventory_number
   warningStatus: number;
 }

 export async function POST(request: Request) {
   try {
     const body = await request.json();
     const { medicine_id, supplier_id, quantity } = body;

     // Validate input
     if (!medicine_id || !supplier_id || quantity == null || quantity <= 0) {
       return NextResponse.json(
         { error: 'Medicine ID, Supplier ID, and a positive Quantity are required' },
         { status: 400 }
       );
     }

     // TODO: Add checks to ensure medicine_id and supplier_id exist in their respective tables

     // Modified query to use AUTO_INCREMENT for inventory_number
     const query = `
       INSERT INTO Inventory (medicine_id, supplier_id, quantity)
       VALUES (?, ?, ?)
     `;
     const params = [medicine_id, supplier_id, quantity];

     const result = await executeQuery<OkPacket>(query, params);

     return NextResponse.json(
       { message: 'Inventory item added successfully', inventory_number: result.insertId },
       { status: 201 } // 201 Created status
     );

   } catch (error) {
     console.error('Error adding inventory item:', error);
     // Handle specific SQL errors
     let errorMessage = 'Failed to add inventory item';
     if (error instanceof Error) {
       // Check for 'ER_NO_DEFAULT_FOR_FIELD' error (auto-increment not set up)
       if ('code' in error && (error as any).code === 'ER_NO_DEFAULT_FOR_FIELD') {
         errorMessage = 'Database error: inventory_number field needs to be set to AUTO_INCREMENT. Please contact your administrator.';
       } else if ('code' in error && (error as any).code === 'ER_NO_REFERENCED_ROW_2') {
         errorMessage = 'Invalid Medicine ID or Supplier ID provided.';
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
     const inventory_number = searchParams.get('inventory_number');
     const body = await request.json();
     const { quantity, medicine_id, supplier_id } = body; // Allow updating quantity, medicine, supplier

     if (!inventory_number) {
       return NextResponse.json({ error: 'Inventory number is required' }, { status: 400 });
     }
     if (quantity == null || quantity < 0) {
        return NextResponse.json({ error: 'Quantity must be a non-negative number' }, { status: 400 });
     }
      // Add validation for medicine_id and supplier_id if they are being updated
      if (medicine_id && isNaN(parseInt(medicine_id))) {
         return NextResponse.json({ error: 'Medicine ID must be a number' }, { status: 400 });
      }
       if (supplier_id && isNaN(parseInt(supplier_id))) {
         return NextResponse.json({ error: 'Supplier ID must be a number' }, { status: 400 });
      }

     // Build the update query dynamically based on provided fields
     let query = 'UPDATE Inventory SET ';
     const params = [];
     const fieldsToUpdate = [];

     if (quantity !== undefined) {
         fieldsToUpdate.push('quantity = ?');
         params.push(quantity);
     }
      if (medicine_id !== undefined) {
         fieldsToUpdate.push('medicine_id = ?');
         params.push(parseInt(medicine_id));
     }
      if (supplier_id !== undefined) {
         fieldsToUpdate.push('supplier_id = ?');
         params.push(parseInt(supplier_id));
     }

      if (fieldsToUpdate.length === 0) {
          return NextResponse.json({ error: 'No fields provided for update' }, { status: 400 });
      }

     query += fieldsToUpdate.join(', ');
     query += ' WHERE inventory_number = ?';
     params.push(inventory_number);


     const result = await executeQuery<OkPacket>(query, params);

     if (result.affectedRows === 0) {
       return NextResponse.json({ error: 'Inventory item not found or no changes made' }, { status: 404 });
     }

     return NextResponse.json({ message: 'Inventory item updated successfully' });

   } catch (error) {
     console.error('Error updating inventory item:', error);
      let errorMessage = 'Failed to update inventory item';
      if (error instanceof Error && 'code' in error) {
          if ((error as any).code === 'ER_NO_REFERENCED_ROW_2') {
              errorMessage = 'Invalid Medicine ID or Supplier ID provided.';
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
     const inventory_number = searchParams.get('inventory_number');

     if (!inventory_number) {
       return NextResponse.json({ error: 'Inventory number is required' }, { status: 400 });
     }

     const query = 'DELETE FROM Inventory WHERE inventory_number = ?';
     const params = [inventory_number];

     const result = await executeQuery<OkPacket>(query, params);

     if (result.affectedRows === 0) {
       return NextResponse.json({ error: 'Inventory item not found' }, { status: 404 });
     }

     return NextResponse.json({ message: 'Inventory item deleted successfully' });

   } catch (error: any) { // Type error as any to check code/errno
     console.error('Error deleting inventory item:', error);
     let errorMessage = 'Failed to delete inventory item';
     let status = 500;
      // Handle foreign key constraint errors (e.g., referenced in expiryalert)
      if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.errno === 1451) {
          errorMessage = 'Cannot delete item, it is referenced in other records (e.g., Expiry Alerts).';
          status = 409; // Conflict status
      }
     return NextResponse.json(
       { error: errorMessage, details: error instanceof Error ? error.message : 'Unknown error' },
       { status: status }
     );
   }
 }
