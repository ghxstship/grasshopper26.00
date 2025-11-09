import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: advanceId } = await params;
    const { comment_text } = await request.json();

    if (!comment_text || !comment_text.trim()) {
      return NextResponse.json(
        { error: 'Comment text is required' },
        { status: 400 }
      );
    }

    // Verify user has access to this advance
    const { data: advance } = await supabase
      .from('production_advances')
      .select('submitter_user_id')
      .eq('id', advanceId)
      .single();

    if (!advance) {
      return NextResponse.json(
        { error: 'Advance not found' },
        { status: 404 }
      );
    }

    // Check if user is owner or admin
    const isOwner = advance.submitter_user_id === user.id;
    let isAdmin = false;

    if (!isOwner) {
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();

      isAdmin = !!userRole;
    }

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Create comment
    const { data: comment, error } = await supabase
      .from('production_advance_comments')
      .insert({
        advance_id: advanceId,
        user_id: user.id,
        comment_text: comment_text.trim(),
        is_internal: isAdmin && !isOwner,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating comment:', error);
      return NextResponse.json(
        { error: 'Failed to create comment' },
        { status: 500 }
      );
    }

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
