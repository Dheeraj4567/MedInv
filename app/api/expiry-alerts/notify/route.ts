import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const { medicineId } = await request.json();

    if (!medicineId) {
      return NextResponse.json(
        { error: "Medicine ID is required" },
        { status: 400 }
      );
    }

    // Get medicine details including supplier information
    const { data: medicineData, error: medicineError } = await supabase
      .from("medicines")
      .select(`
        id,
        name,
        expiry_date,
        batch_number,
        suppliers (
          id,
          name,
          email,
          contact_number
        )
      `)
      .eq('id', medicineId)
      .single();

    if (medicineError || !medicineData) {
      console.error("Error fetching medicine:", medicineError);
      return NextResponse.json(
        { error: "Failed to fetch medicine details" },
        { status: 500 }
      );
    }

    // Log the notification in a notifications table
    const { error: notificationError } = await supabase
      .from("notifications")
      .insert({
        type: "expiry_alert",
        recipient_type: "supplier",
        recipient_id: medicineData.suppliers?.id,
        content: `Notification about medicine "${medicineData.name}" (Batch: ${medicineData.batch_number}) approaching expiry date of ${medicineData.expiry_date}`,
        status: "sent",
        created_at: new Date().toISOString()
      });

    if (notificationError) {
      console.error("Error logging notification:", notificationError);
      // Continue execution even if logging fails
    }

    // In a real application, you would send an actual email or SMS here
    // For now, we'll just simulate a successful notification

    return NextResponse.json({
      message: "Notification sent successfully",
      details: {
        medicine: medicineData.name,
        batch: medicineData.batch_number,
        supplier: medicineData.suppliers?.name,
        contact: medicineData.suppliers?.contact_number,
        email: medicineData.suppliers?.email
      }
    }, { status: 200 });
    
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}