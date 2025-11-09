import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ApproveAdvanceRequest } from '@/lib/types/production-advances';

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

    // Verify admin permissions
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (!userRole) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body: ApproveAdvanceRequest = await request.json();
    const { decision, rejection_reason, assigned_users, internal_notes } = body;

    // Validate decision
    if (!['approved', 'rejected', 'partially_approved'].includes(decision)) {
      return NextResponse.json(
        { error: 'Invalid decision' },
        { status: 400 }
      );
    }

    // If rejected, require rejection reason
    if (decision === 'rejected' && !rejection_reason) {
      return NextResponse.json(
        { error: 'Rejection reason is required' },
        { status: 400 }
      );
    }

    // Get current advance for status history
    const { data: currentAdvance } = await supabase
      .from('production_advances')
      .select('status')
      .eq('id', id)
      .single();

    if (!currentAdvance) {
      return NextResponse.json(
        { error: 'Advance not found' },
        { status: 404 }
      );
    }

    // Update advance
    const updateData: any = {
      approval_status: decision,
      status: decision === 'approved' ? 'approved' : decision === 'rejected' ? 'rejected' : 'under_review',
      approved_by: user.id,
      approved_at: new Date().toISOString(),
      rejection_reason: decision === 'rejected' ? rejection_reason : null,
      assigned_to_user_ids: assigned_users || null,
      internal_notes: internal_notes || null,
    };

    const { data: advance, error: updateError } = await supabase
      .from('production_advances')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating advance:', updateError);
      return NextResponse.json(
        { error: 'Failed to update advance' },
        { status: 500 }
      );
    }

    // Log status change
    await supabase
      .from('production_advance_status_history')
      .insert({
        advance_id: id,
        from_status: currentAdvance.status,
        to_status: advance.status,
        changed_by: user.id,
        notes: decision === 'rejected' ? rejection_reason : null,
      });

    // Send notification email
    try {
      const { sendAdvanceApprovedEmail, sendAdvanceRejectedEmail } = await import('@/lib/email/send-advance-emails');
      
      if (decision === 'approved') {
        await sendAdvanceApprovedEmail(advance);
      } else if (decision === 'rejected') {
        await sendAdvanceRejectedEmail(advance);
      }
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError);
      // Don't fail the request if email fails
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
