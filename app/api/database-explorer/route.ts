import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, executeRawQuery } from '@/lib/mysql';

// GET handler to fetch table list
export async function GET(request: NextRequest) {
  try {
    // Query to get a list of all tables in the database
    const tables = await executeRawQuery(
      "SELECT table_name, table_rows FROM information_schema.tables WHERE table_schema = 'test2' ORDER BY table_name"
    );
    
    return NextResponse.json({ tables }, { status: 200 });
  } catch (error) {
    console.error('Error fetching tables:', error);
    return NextResponse.json(
      { error: 'Failed to fetch database tables' }, 
      { status: 500 }
    );
  }
}

// POST handler for executing queries
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query } = body;
    
    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }
    
    // Execute the query against the database
    const result = await executeRawQuery(query);
    
    // Return the query results
    return NextResponse.json({ result }, { status: 200 });
  } catch (error) {
    console.error('Database query error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An error occurred while executing the query' },
      { status: 500 }
    );
  }
}