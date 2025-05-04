import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql';

// Define the expected structure based on Feedback and Patient tables
interface FeedbackInfo {
  feedback_id: number;
  patient_id: number;
  patient_name: string; // From Patient table
  ratings: number | null; // Assuming ratings column exists
  // Add other relevant fields if needed, e.g., comment, date, status
}

export async function GET() {
  try {
    // Adjust the query based on the actual columns in your Feedback table
    const query = `
      SELECT 
        f.feedback_id, 
        f.patient_id, 
        p.name AS patient_name, 
        f.ratings
        -- Add other columns like comment, date, status here if they exist
      FROM Feedback f
      JOIN Patient p ON f.patient_id = p.patient_id
      ORDER BY f.feedback_id DESC; 
      -- Consider adding date ordering if a date column exists
    `;
    const feedbackData = await executeQuery<FeedbackInfo[]>(query);

    if (!feedbackData || feedbackData.length === 0) {
      return NextResponse.json([]); // Return empty array if no feedback
    }

    return NextResponse.json(feedbackData);
  } catch (error) {
    console.error('Error fetching feedback data:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to fetch feedback data', details: errorMessage }, { status: 500 });
  }
}
