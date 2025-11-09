/**
 * Individual Credential API
 * Manage specific credential operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/events/[id]/credentials/[credentialId]
 * Get credential details
 */
export async function GET(
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

    const { data: credential, error } = await supabase
      .from('event_credentials')
      .select(`
        *,
        event:events(id, name, start_date, end_date),
        team_assignment:event_team_assignments(
          id,
          user:users(id, email, full_name, avatar_url)
        )
      `)
      .eq('id', credentialId)
      .single();

    if (error || !credential) {
      return NextResponse.json(
        { error: 'Credential not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ credential });
  } catch (error) {
    console.error('Credential fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/events/[id]/credentials/[credentialId]
 * Update credential
 */
export async function PATCH(
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
    const updates: any = {};

    // Allow updating specific fields
    const allowedFields = [
      'holder_name',
      'holder_company',
      'holder_role',
      'holder_photo_url',
      'access_permissions',
      'valid_from',
      'valid_until',
      'is_active',
      'badge_color',
      'notes',
    ];

    allowedFields.forEach((field) => {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    });

    const { data: credential, error } = await supabase
      .from('event_credentials')
      .update(updates)
      .eq('id', credentialId)
      .select()
      .single();

    if (error) {
      console.error('Error updating credential:', error);
      return NextResponse.json(
        { error: 'Failed to update credential' },
        { status: 500 }
      );
    }

    return NextResponse.json({ credential });
  } catch (error) {
    console.error('Credential update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/events/[id]/credentials/[credentialId]
 * Revoke credential
 */
export async function DELETE(
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
    const { searchParams } = new URL(request.url);
    const reason = searchParams.get('reason') || 'Revoked by admin';

    // Soft delete - mark as revoked
    const { data: credential, error } = await supabase
      .from('event_credentials')
      .update({
        revoked: true,
        revoked_at: new Date().toISOString(),
        revoked_by: user.id,
        revoke_reason: reason,
        is_active: false,
      })
      .eq('id', credentialId)
      .select()
      .single();

    if (error) {
      console.error('Error revoking credential:', error);
      return NextResponse.json(
        { error: 'Failed to revoke credential' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: 'Credential revoked successfully',
      credential 
    });
  } catch (error) {
    console.error('Credential revoke error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
