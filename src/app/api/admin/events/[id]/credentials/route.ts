/**
 * Event Credentials API
 * Manages event credentials and access badges
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/events/[id]/credentials
 * List all credentials for an event
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const eventId = id;

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const credentialType = searchParams.get('type');
    const isActive = searchParams.get('active');
    const checkedIn = searchParams.get('checked_in');

    // Build query
    let query = supabase
      .from('event_credentials')
      .select(`
        *,
        event:events(id, name, start_date),
        team_assignment:event_team_assignments(
          id,
          user:users(id, email, full_name)
        )
      `)
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });

    // Apply filters
    if (credentialType) {
      query = query.eq('credential_type', credentialType);
    }
    if (isActive !== null) {
      query = query.eq('is_active', isActive === 'true');
    }
    if (checkedIn !== null) {
      query = query.eq('checked_in', checkedIn === 'true');
    }

    const { data: credentials, error } = await query;

    if (error) {
      console.error('Error fetching credentials:', error);
      return NextResponse.json(
        { error: 'Failed to fetch credentials' },
        { status: 500 }
      );
    }

    return NextResponse.json({ credentials });
  } catch (error) {
    console.error('Credentials fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/events/[id]/credentials
 * Issue a new credential
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const eventId = id;

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      credential_type,
      holder_name,
      holder_company,
      holder_role,
      holder_photo_url,
      team_assignment_id,
      access_permissions,
      valid_from,
      valid_until,
      badge_color,
      notes,
    } = body;

    // Validate required fields
    if (!credential_type || !holder_name) {
      return NextResponse.json(
        { error: 'Missing required fields: credential_type, holder_name' },
        { status: 400 }
      );
    }

    // Generate credential number
    const credentialNumber = await generateCredentialNumber(supabase, eventId, credential_type);

    // Get default permissions for credential type
    const { data: template } = await supabase
      .from('event_team_role_templates')
      .select('default_permissions')
      .eq('team_role', credential_type)
      .single();

    const defaultPermissions = template?.default_permissions || {};
    const finalPermissions = { ...defaultPermissions, ...access_permissions };

    // Create credential
    const { data: credential, error } = await supabase
      .from('event_credentials')
      .insert({
        event_id: eventId,
        team_assignment_id,
        credential_type,
        credential_number: credentialNumber,
        badge_color: badge_color || getDefaultBadgeColor(credential_type),
        holder_name,
        holder_company,
        holder_role,
        holder_photo_url,
        access_permissions: finalPermissions,
        valid_from: valid_from || new Date().toISOString(),
        valid_until,
        notes,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating credential:', error);
      return NextResponse.json(
        { error: 'Failed to create credential' },
        { status: 500 }
      );
    }

    return NextResponse.json({ credential }, { status: 201 });
  } catch (error) {
    console.error('Credential creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Generate unique credential number
 */
async function generateCredentialNumber(
  supabase: any,
  eventId: string,
  credentialType: string
): Promise<string> {
  const prefix = credentialType.toUpperCase().substring(0, 3);
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Get default badge color for credential type
 */
function getDefaultBadgeColor(credentialType: string): string {
  const colors: Record<string, string> = {
    aaa: 'red',
    aa: 'yellow',
    production: 'blue',
    staff: 'green',
    vendor: 'orange',
    media: 'purple',
    guest: 'white',
  };
  return colors[credentialType] || 'gray';
}
