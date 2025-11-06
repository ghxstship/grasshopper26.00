import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { syncEventToATLVS } from '@/lib/integrations/atlvs';

export async function POST(req: Request) {
  try {
    const eventData = await req.json();
    const supabase = await createClient();

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin role
    const { data: adminData } = await supabase
      .from('brand_admins')
      .select('brand_id, role')
      .eq('user_id', user.id)
      .single();

    if (!adminData || !['owner', 'admin', 'editor'].includes(adminData.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Create event
    const { data: event, error } = await supabase
      .from('events')
      .insert({
        ...eventData,
        brand_id: adminData.brand_id,
      })
      .select()
      .single();

    if (error) {
      console.error('Event creation error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Sync to ATLVS
    try {
      await syncEventToATLVS({
        id: event.id,
        name: event.name,
        start_date: event.start_date,
        end_date: event.end_date,
        venue_name: event.venue_name,
        status: event.status,
      });
    } catch (atlvsError) {
      console.error('ATLVS sync error:', atlvsError);
      // Don't fail the request if ATLVS sync fails
    }

    return NextResponse.json({ success: true, event });
  } catch (error) {
    console.error('Event creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const brandId = searchParams.get('brandId');

    let query = supabase
      .from('events')
      .select(`
        *,
        event_artists (
          artist_id,
          artists (name, profile_image_url)
        ),
        ticket_types (
          id,
          name,
          price,
          quantity_available,
          quantity_sold
        )
      `)
      .order('start_date', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    if (brandId) {
      query = query.eq('brand_id', brandId);
    }

    const { data: events, error } = await query;

    if (error) {
      console.error('Events fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ events });
  } catch (error) {
    console.error('Events fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, ...updates } = await req.json();
    const supabase = await createClient();

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin role
    const { data: adminData } = await supabase
      .from('brand_admins')
      .select('brand_id, role')
      .eq('user_id', user.id)
      .single();

    if (!adminData || !['owner', 'admin', 'editor'].includes(adminData.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Update event
    const { data: event, error } = await supabase
      .from('events')
      .update(updates)
      .eq('id', id)
      .eq('brand_id', adminData.brand_id)
      .select()
      .single();

    if (error) {
      console.error('Event update error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Sync to ATLVS
    try {
      await syncEventToATLVS({
        id: event.id,
        name: event.name,
        start_date: event.start_date,
        end_date: event.end_date,
        venue_name: event.venue_name,
        status: event.status,
      });
    } catch (atlvsError) {
      console.error('ATLVS sync error:', atlvsError);
    }

    return NextResponse.json({ success: true, event });
  } catch (error) {
    console.error('Event update error:', error);
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Event ID required' }, { status: 400 });
    }

    const supabase = await createClient();

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin role
    const { data: adminData } = await supabase
      .from('brand_admins')
      .select('brand_id, role')
      .eq('user_id', user.id)
      .single();

    if (!adminData || !['owner', 'admin'].includes(adminData.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete event
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id)
      .eq('brand_id', adminData.brand_id);

    if (error) {
      console.error('Event deletion error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Event deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    );
  }
}
