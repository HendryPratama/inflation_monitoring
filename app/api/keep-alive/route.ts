import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase'; // Pastikan path import ini sesuai dengan project Anda

// Endpoint ini akan dipanggil oleh Vercel Cron
export async function GET() {
  try {
    // Lakukan query seringan mungkin, misalnya mengambil 1 baris id saja
    const { data, error } = await supabase
      .from('inflation_data')
      .select('id')
      .limit(1);

    if (error) throw error;

    return NextResponse.json({ 
      status: 'success', 
      message: 'Supabase pinged successfully to prevent pause',
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ 
      status: 'error', 
      message: error.message 
    }, { status: 500 });
  }
}