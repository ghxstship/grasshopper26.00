import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    const eventId = searchParams.get('event_id');
    const userId = searchParams.get('user_id');

    let query = supabase
      .from('tickets')
      .select(`
        *,
        ticket_types (*),
        orders (*)
      `);

    if (eventId) {
      query = query.eq('ticket_type_id', eventId);
    }

    if (userId) {
      query = query.eq('orders.user_id', userId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ tickets: data });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch tickets' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const { data, error } = await supabase
      .from('tickets')
      .insert(body)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ ticket: data }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create ticket' },
      { status: 500 }
    );
  }
}
