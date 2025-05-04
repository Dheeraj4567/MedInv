import { NextResponse } from "next/server";
import { executeQuery } from '@/lib/mysql'; // Use MySQL helper

// Function to get current date in YYYY-MM-DD format
function getCurrentDate() {
  return new Date().toISOString().split('T')[0];
}

// Function to get date X days from now in YYYY-MM-DD format
function getDateInXDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

interface ExpiryAlertItem {
  medicine_id: number;
  medicine_name: string;
  expiry_date: string;
  quantity: number; // From Inventory table
  supplier_name: string | null;
  supplier_contact_info: string | null; // Renamed from supplier_contact
}

export async function GET() {
  try {
    const today = getCurrentDate();
    const ninetyDaysFromNow = getDateInXDays(90);

    // Query Inventory, join Medicine and Supplier - Use contact_info
    const query = `
      SELECT 
        m.medicine_id,
        m.name as medicine_name,
        m.expiry_date,
        i.quantity, /* Get quantity from Inventory */
        s.name as supplier_name,
        s.contact_info as supplier_contact_info /* Use 'contact_info' */
      FROM Inventory i 
      JOIN Medicine m ON i.medicine_id = m.medicine_id
      LEFT JOIN Supplier s ON i.supplier_id = s.supplier_id /* Join Supplier via Inventory */
      WHERE m.expiry_date <= ? 
      ORDER BY m.expiry_date ASC
    `;
    
    const params = [ninetyDaysFromNow];

    // Use the updated interface
    const data = await executeQuery<ExpiryAlertItem[]>(query, params);

    if (!data) {
       return NextResponse.json([], { status: 200 });
    }
    
    // Calculate days until expiry for each item
    const expiryAlerts = data.map(item => {
      const expiryDate = new Date(item.expiry_date);
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0); 
      expiryDate.setHours(0, 0, 0, 0); 

      const diffTime = expiryDate.getTime() - currentDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); 
      
      return {
        medicine_id: item.medicine_id,
        medicine_name: item.medicine_name,
        expiry_date: item.expiry_date, 
        quantity: item.quantity, // Use quantity from Inventory
        days_remaining: diffDays,
        supplier_name: item.supplier_name || 'Unknown',
        supplier_contact_info: item.supplier_contact_info // Use the correct field name
      };
    });

    return NextResponse.json(expiryAlerts, { status: 200 });

  } catch (error) {
    console.error("Server error fetching expiry alerts:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch expiry alerts",
        details: error instanceof Error ? error.message : "Internal server error" 
      },
      { status: 500 }
    );
  }
}
