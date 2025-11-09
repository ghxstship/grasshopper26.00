import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const body = await request.json();

    const { data: eventArtist, error } = await supabase
      .from('event_artists')
      .update({
        is_headliner: body.is_headliner,
        billing_order: body.billing_order,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ eventArtist });
  } catch (error: any) {
    console.error('Error updating event artist:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update event artist' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { error } = await supabase
      .from('event_artists')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error removing event artist:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to remove event artist' },
      { status: 500 }
    );
  }
}
