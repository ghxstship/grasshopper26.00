import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    
    const { data: ticketTypes, error } = await supabase
      .from('ticket_types')
      .select('*')
      .eq('event_id', id)
      .order('price', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ ticketTypes: ticketTypes || [] });
  } catch (error: any) {
    console.error('Get ticket types error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get ticket types' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const { data: ticketType, error } = await supabase
      .from('ticket_types')
      .insert({
        event_id: id,
        name: body.name,
        description: body.description,
        price: body.price,
        quantity: body.quantity,
        max_per_order: body.max_per_order,
        sale_start: body.sale_start || null,
        sale_end: body.sale_end || null,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, ticketType });
  } catch (error: any) {
    console.error('Create ticket type error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create ticket type' },
      { status: 500 }
    );
  }
}
