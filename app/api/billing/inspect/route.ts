import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql';

export async function GET() {
  try {
    // Get the actual column structure of the Billing table
    const query = `DESCRIBE Billing`;
    const tableStructure = await executeQuery(query);

    return NextResponse.json(tableStructure);
  } catch (error) {
    console.error('Error inspecting Billing table:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to inspect table structure', details: errorMessage }, { status: 500 });
  }
}