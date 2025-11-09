import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { rateLimit, RateLimitPresets } from '@/lib/api/rate-limiter';

/**
 * GET /api/admin/venues
 * List all venues with filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    await rateLimit(request, RateLimitPresets.read);

    const supabase = await createClient();

    // Check authentication and admin role
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['super_admin', 'brand_admin', 'event_manager'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const search = searchParams.get('search') || '';
    const city = searchParams.get('city') || '';
    const sortBy = searchParams.get('sortBy') || 'name';
    const sortOrder = searchParams.get('sortOrder') || 'asc';

    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('venues')
      .select('*', { count: 'exact' });

    // Apply filters
    if (search) {
      query = query.or(`name.ilike.%${search}%,address.ilike.%${search}%`);
    }

    if (city) {
      query = query.eq('city', city);
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: venues, error, count } = await query;

    if (error) {
      console.error('Error fetching venues:', error);
      return NextResponse.json(
        { error: 'Failed to fetch venues' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      venues,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Error in GET /api/admin/venues:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/venues
 * Create a new venue
 */
export async function POST(request: NextRequest) {
  try {
    await rateLimit(request, RateLimitPresets.write);

    const supabase = await createClient();

    // Check authentication and admin role
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['super_admin', 'brand_admin', 'event_manager'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      address,
      city,
      state,
      zip_code,
      country,
      capacity,
      seating_map,
      amenities,
      parking_info,
      accessibility_info,
      contact_email,
      contact_phone,
    } = body;

    // Validate required fields
    if (!name || !address || !city || !country) {
      return NextResponse.json(
        { error: 'Missing required fields: name, address, city, country' },
        { status: 400 }
      );
    }

    // Create venue
    const { data: newVenue, error: createError } = await supabase
      .from('venues')
      .insert({
        name,
        address,
        city,
        state,
        zip_code,
        country,
        capacity,
        seating_map: seating_map || {},
        amenities: amenities || [],
        parking_info,
        accessibility_info,
        contact_email,
        contact_phone,
        created_by: user.id,
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating venue:', createError);
      return NextResponse.json(
        { error: createError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ venue: newVenue }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/admin/venues:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
