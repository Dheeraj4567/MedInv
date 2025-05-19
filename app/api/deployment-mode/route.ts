import { getCurrentDeploymentMode } from '@/lib/mysql';
import { NextRequest, NextResponse } from 'next/server';

/**
 * API endpoint to get the current deployment mode
 * Used by the DeploymentModeIndicator component
 */
export async function GET(request: NextRequest) {
  try {
    // Get the current deployment mode from the mysql library
    const mode = getCurrentDeploymentMode();
    
    // Return the mode as JSON
    return NextResponse.json({ mode }, { status: 200 });
  } catch (error) {
    console.error('Error fetching deployment mode:', error);
    return NextResponse.json({ error: 'Failed to get deployment mode' }, { status: 500 });
  }
}
