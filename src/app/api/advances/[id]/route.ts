import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const { data: advance, error } = await supabase
      .from('production_advances')
      .select(`
        *,
        items:production_advance_items(*),
        comments:production_advance_comments(*),
        status_history:production_advance_status_history(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching advance:', error);
      return NextResponse.json(
        { error: 'Advance not found' },
        { status: 404 }
      );
    }

    // Check if user has access to this advance
    if (advance.submitter_user_id !== user.id) {
      // Check if user is admin
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();

      if (!userRole) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({ advance });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Verify ownership
    const { data: advance } = await supabase
      .from('production_advances')
      .select('submitter_user_id, status')
      .eq('id', id)
      .single();

    if (!advance || advance.submitter_user_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Only allow updates to draft advances
    if (advance.status !== 'draft') {
      return NextResponse.json(
        { error: 'Cannot update submitted advance' },
        { status: 400 }
      );
    }

    const { data: updatedAdvance, error } = await supabase
      .from('production_advances')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating advance:', error);
      return NextResponse.json(
        { error: 'Failed to update advance' },
        { status: 500 }
      );
    }

    return NextResponse.json({ advance: updatedAdvance });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify ownership
    const { data: advance } = await supabase
      .from('production_advances')
      .select('submitter_user_id, status')
      .eq('id', id)
      .single();

    if (!advance || advance.submitter_user_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Only allow deletion of draft advances
    if (advance.status !== 'draft') {
      return NextResponse.json(
        { error: 'Cannot delete submitted advance' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('production_advances')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting advance:', error);
      return NextResponse.json(
        { error: 'Failed to delete advance' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
