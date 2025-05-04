import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql';

export async function GET() {
  try {
    const orders = await executeQuery<{ order_id: number; patient_name: string; patient_id: number; medicine_name: string; order_date: string; log_date: string }[]>(
      `SELECT o.order_id, p.name AS patient_name, p.patient_id, m.name AS medicine_name, o.order_date, ml.log_date
       FROM Orders o
       JOIN Patient p ON o.patient_id = p.patient_id
       JOIN OrderItems oi ON o.order_id = oi.order_id
       JOIN Medicine m ON oi.medicine_id = m.medicine_id
       JOIN MedicalLogs ml ON ml.patient_id = p.patient_id
       ORDER BY o.order_date DESC`
    );
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}