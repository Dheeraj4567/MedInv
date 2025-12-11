import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql';

// Define the expected structure based on Feedback and Patient tables
interface FeedbackInfo {
  feedback_id: number;
  patient_id: number;
  patient_name: string;
  title: string;
  description: string | null;
  rating: number | null;
  feedback_date: string;
}

export async function GET() {
  try {
    const query = `
      SELECT 
        f.feedback_id, 
        f.patient_id, 
        p.name AS patient_name, 
        f.title,
        f.description,
        f.rating,
        f.feedback_date
      FROM Feedback f
      LEFT JOIN Patient p ON f.patient_id = p.patient_id
      ORDER BY f.feedback_date DESC; 
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
