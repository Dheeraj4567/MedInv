import { NextResponse } from 'next/server';

export async function GET() {
  // Mock data for dashboard stats
  const dashboardStats = {
    totalInventory: 5000,
    expiringItems: 120,
    pendingOrders: 45,
    activeSuppliers: 15
  };

  return NextResponse.json(dashboardStats);
}