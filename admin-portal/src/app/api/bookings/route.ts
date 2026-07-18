import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      artist_id,
      client_name,
      client_email,
      client_phone,
      event_type,
      event_date,
      event_time,
      venue,
      budget,
      notes
    } = body;

    if (!artist_id || !client_name || !client_email) {
      return NextResponse.json(
        { error: 'artist_id, client_name, and client_email are required' },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    );
    const insertData: any = {
      artist_id,
      client_name,
      event_type,
      event_date,
      venue,
      budget,
      status: 'pending',
      booking_source: 'client',
    };
    if (client_email) insertData.client_email = client_email;
    if (client_phone) insertData.client_phone = client_phone;
    if (event_time) insertData.event_time = event_time;
    if (notes) insertData.notes = notes;

    const { data, error } = await supabase
      .from('bookings')
      .insert([insertData])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Booking request submitted successfully',
      booking: data
    }, { status: 201 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
