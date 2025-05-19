import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql';

export async function GET() {
  try {
    // Get monthly order data
    const monthlyData = await executeQuery<{ name: string; orders: number; revenue: number }[]>(
      `SELECT 
        DATE_FORMAT(o.order_date, '%b') as name,
        COUNT(DISTINCT o.order_id) as orders,
        SUM(oi.quantity * m.price) as revenue
       FROM Orders o
       JOIN OrderItems oi ON o.order_id = oi.order_id
       JOIN Medicine m ON oi.medicine_id = m.medicine_id
       WHERE o.order_date >= DATE_SUB(CURDATE(), INTERVAL 7 MONTH)
       GROUP BY DATE_FORMAT(o.order_date, '%b'), MONTH(o.order_date)
       ORDER BY MONTH(o.order_date)`
    );

    // Get order statistics
    const [totalOrders] = await executeQuery<[{ total: number }]>(
      `SELECT COUNT(*) as total FROM Orders`
    );

    const [averageValue] = await executeQuery<[{ average: number }]>(
      `SELECT AVG(order_total.total) as average 
       FROM (
         SELECT o.order_id, SUM(oi.quantity * m.price) as total
         FROM Orders o
         JOIN OrderItems oi ON o.order_id = oi.order_id
         JOIN Medicine m ON oi.medicine_id = m.medicine_id
         GROUP BY o.order_id
       ) as order_total`
    );

    // Since the Orders table doesn't have a status column, we'll use a simple count
    // In a real application, you would add a status column to the Orders table
    const [pendingOrders] = await executeQuery<[{ total: number }]>(
      `SELECT COUNT(*) as total FROM Orders`
    );

    // Calculate percentage changes (in a real app, you would compare with previous periods)
    // Here we're just providing sample values
    const stats = [
      {
        title: "Total Orders",
        value: totalOrders?.total || 0,
        change: "+4.75%",
        trend: "up"
      },
      {
        title: "Average Value",
        value: averageValue?.average ? `₹${Math.round(averageValue.average)}` : "₹0",
        change: "+1.51%",
        trend: "up"
      },
      {
        title: "Pending",
        value: pendingOrders?.total || 0,
        change: "-2.23%",
        trend: "down"
      }
    ];

    return NextResponse.json({
      monthlyData: monthlyData || [],
      stats
    });
  } catch (error) {
    console.error('Error fetching orders overview:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}