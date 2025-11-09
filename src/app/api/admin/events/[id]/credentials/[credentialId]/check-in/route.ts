/**
 * Credential Check-in API
 * Handle credential check-in/check-out operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/events/[id]/credentials/[credentialId]/check-in
 * Check in a credential holder
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; credentialId: string }> }
) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, credentialId } = await params;
    const body = await request.json();
    const { action } = body; // 'check-in' or 'check-out'

    if (action === 'check-in') {
      // Check in
      const { data: credential, error } = await supabase
        .from('event_credentials')
        .update({
          checked_in: true,
          checked_in_at: new Date().toISOString(),
          checked_in_by: user.id,
        })
        .eq('id', credentialId)
        .select()
        .single();

      if (error) {
        console.error('Error checking in credential:', error);
        return NextResponse.json(
          { error: 'Failed to check in credential' },
          { status: 500 }
        );
      }

      return NextResponse.json({ 
        message: 'Credential checked in successfully',
        credential 
      });
    } else if (action === 'check-out') {
      // Check out
      const { data: credential, error } = await supabase
        .from('event_credentials')
        .update({
          checked_out: true,
          checked_out_at: new Date().toISOString(),
        })
        .eq('id', credentialId)
        .select()
        .single();

      if (error) {
        console.error('Error checking out credential:', error);
        return NextResponse.json(
          { error: 'Failed to check out credential' },
          { status: 500 }
        );
      }

      return NextResponse.json({ 
        message: 'Credential checked out successfully',
        credential 
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Must be "check-in" or "check-out"' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Check-in error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
