/**
 * Credential Badge Printing API
 * Generate printable badge for credential
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/events/[id]/credentials/[credentialId]/print
 * Mark credential as printed and generate badge data
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

    // Get credential details
    const { data: credential, error: fetchError } = await supabase
      .from('event_credentials')
      .select(`
        *,
        event:events(id, name, start_date, end_date, venue_name),
        team_assignment:event_team_assignments(
          id,
          user:users(id, email, full_name, avatar_url)
        )
      `)
      .eq('id', credentialId)
      .single();

    if (fetchError || !credential) {
      return NextResponse.json(
        { error: 'Credential not found' },
        { status: 404 }
      );
    }

    // Mark as printed
    const { error: updateError } = await supabase
      .from('event_credentials')
      .update({
        printed: true,
        printed_at: new Date().toISOString(),
        printed_by: user.id,
      })
      .eq('id', credentialId);

    if (updateError) {
      console.error('Error marking credential as printed:', updateError);
      return NextResponse.json(
        { error: 'Failed to update credential' },
        { status: 500 }
      );
    }

    // Generate badge data for printing
    const badgeData = {
      credential_number: credential.credential_number,
      credential_type: credential.credential_type,
      badge_color: credential.badge_color,
      holder_name: credential.holder_name,
      holder_company: credential.holder_company,
      holder_role: credential.holder_role,
      holder_photo_url: credential.holder_photo_url,
      event_name: credential.event?.name,
      venue_name: credential.event?.venue_name,
      valid_from: credential.valid_from,
      valid_until: credential.valid_until,
      access_permissions: credential.access_permissions,
      qr_code_data: `CRED:${credential.id}:${credential.credential_number}`,
    };

    return NextResponse.json({ 
      message: 'Badge ready for printing',
      badge: badgeData,
      credential 
    });
  } catch (error) {
    console.error('Badge print error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
