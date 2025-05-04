import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql';

export async function GET() {
  try {
    // Removed user_name from the query as it doesn't exist in the actual database
    const recentActivity = await executeQuery<{ id: number; action: string; details: string; type: string; timestamp: string }[]>(
      `SELECT id, action, details, type, timestamp FROM ActivityLog ORDER BY timestamp DESC LIMIT 10`
    );

    // Check if the result is empty
    if (recentActivity.length === 0) {
      return NextResponse.json({ message: 'No recent activity found' }, { status: 404 });
    }

    return NextResponse.json(recentActivity);
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return NextResponse.json({ error: 'Failed to fetch recent activity' }, { status: 500 });
  }
}
