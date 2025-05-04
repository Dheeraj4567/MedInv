import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql'; // Assuming executeQuery is correctly set up

interface KeyStat {
  value: number;
  change: number; // Represents the absolute change from the previous period
  changeType: 'positive' | 'negative' | 'neutral';
  changeDisplay: string; // Formatted string like "+12%" or "+2"
}

interface DashboardKeyStats {
  totalInventory: KeyStat;
  expiringSoon: KeyStat;
  pendingOrders: KeyStat;
  activeSuppliers: KeyStat;
}

// Helper function to calculate change and format display
function calculateChange(current: number, previous: number, format: 'percentage' | 'absolute'): KeyStat {
  const change = current - previous;
  let changeType: 'positive' | 'negative' | 'neutral' = 'neutral';
  if (change > 0) changeType = 'positive';
  if (change < 0) changeType = 'negative';

  let changeDisplay = '0';
  if (format === 'percentage') {
    const percentageChange = previous === 0 ? (current > 0 ? 100 : 0) : Math.round((change / previous) * 100);
    changeDisplay = `${change >= 0 ? '+' : ''}${percentageChange}%`;
  } else { // absolute
    changeDisplay = `${change >= 0 ? '+' : ''}${change}`;
  }
  // Handle edge case where change is 0 but display might show "+0%" or "+0"
  if (change === 0) {
      changeDisplay = format === 'percentage' ? '0%' : '0';
  }


  return {
    value: current,
    change: change,
    changeType: changeType,
    changeDisplay: changeDisplay,
  };
}


export async function GET() {
  try {
    // --- Get Current Values ---

    // Total Inventory (Sum of quantities)
    const inventoryResult = await executeQuery<{ total_items: number }[]>('SELECT SUM(quantity) as total_items FROM Inventory');
    const currentInventory = inventoryResult?.[0]?.total_items ?? 0;

    // Expiring Soon (Within 30 days)
    const expiringSoonResult = await executeQuery<{ count: number }[]>(`
      SELECT COUNT(*) as count
      FROM Medicine
      WHERE expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
    `);
    const currentExpiringSoon = expiringSoonResult?.[0]?.count ?? 0;

    // Pending Orders
    const pendingOrdersResult = await executeQuery<{ count: number }[]>(`
      SELECT COUNT(*) as count FROM Orders
    `);
    const currentPendingOrders = pendingOrdersResult?.[0]?.count ?? 0;

    // Active Suppliers (Remove 'status' condition)
    const activeSuppliersResult = await executeQuery<{ count: number }[]>(`
      SELECT COUNT(*) as count FROM Supplier
    `);
    const currentActiveSuppliers = activeSuppliersResult?.[0]?.count ?? 0;


    // --- Get Previous Month's Values (Example: Using hardcoded values for now) ---
    // !! IMPORTANT: Replace these with actual queries for the previous month's data !!
    // Calculating previous month's data accurately requires more complex date-based queries
    // or historical data snapshots, which depend heavily on the database schema and business logic.
    // For demonstration, we'll use placeholder previous values derived from the screenshot's percentages/changes.

    // Example: If current is 5000 and change is +12%, previous was ~ 5000 / 1.12 = 4464
    const previousInventory = 4464;
    // Example: If current is 120 and change is -5%, previous was ~ 120 / 0.95 = 126
    const previousExpiringSoon = 126;
     // Example: If current is 45 and change is +8%, previous was ~ 45 / 1.08 = 42
    const previousPendingOrders = 42;
    // Example: If current is 15 and change is +2, previous was 15 - 2 = 13
    const previousActiveSuppliers = 13;


    // --- Calculate Changes ---
    const stats: DashboardKeyStats = {
      totalInventory: calculateChange(currentInventory, previousInventory, 'percentage'),
      expiringSoon: calculateChange(currentExpiringSoon, previousExpiringSoon, 'percentage'),
      pendingOrders: calculateChange(currentPendingOrders, previousPendingOrders, 'percentage'),
      activeSuppliers: calculateChange(currentActiveSuppliers, previousActiveSuppliers, 'absolute'),
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Error fetching dashboard key stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard key stats', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
