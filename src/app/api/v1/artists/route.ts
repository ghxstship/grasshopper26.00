import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { handleAPIError, asyncHandler } from '@/lib/api/error-handler';
import { requireAuth, parsePagination, parseSort, parseFilters } from '@/lib/api/middleware';
import { rateLimit, RateLimitPresets } from '@/lib/api/rate-limiter';
import { createArtistSchema, artistQuerySchema } from '@/lib/validations/schemas';

// GET /api/v1/artists - List artists with filtering
export const GET = asyncHandler(async (req: Request) => {
  const nextReq = req as NextRequest;
  await rateLimit(nextReq, RateLimitPresets.read);

  const supabase = await createClient();
  
  // Parse query parameters
  const searchParams = nextReq.nextUrl.searchParams;
  const pagination = parsePagination(nextReq);
  const sort = parseSort(nextReq, ['name', 'created_at'], 'name');
  
  const search = searchParams.get('search');
  const genre = searchParams.get('genre');
  const verified = searchParams.get('verified');

  // Validate query params
  const query = artistQuerySchema.parse({
    search: search || undefined,
    genre: genre || undefined,
    verified: verified ? verified === 'true' : undefined,
    limit: pagination.limit,
    offset: pagination.offset,
    sortBy: sort.sortBy,
    sortOrder: sort.sortOrder,
  });

  // Build query
  let queryBuilder = supabase
    .from('artists')
    .select('*', { count: 'exact' });

  // Apply filters
  if (query.search) {
    queryBuilder = queryBuilder.or(`name.ilike.%${query.search}%,bio.ilike.%${query.search}%`);
  }

  if (query.genre) {
    queryBuilder = queryBuilder.contains('genre_tags', [query.genre]);
  }

  if (query.verified !== undefined) {
    queryBuilder = queryBuilder.eq('verified', query.verified);
  }

  // Apply sorting
  queryBuilder = queryBuilder.order(query.sortBy, { ascending: query.sortOrder === 'asc' });

  // Apply pagination
  queryBuilder = queryBuilder.range(query.offset, query.offset + query.limit - 1);

  const { data: artists, error, count } = await queryBuilder;

  if (error) {
    throw error;
  }

  return NextResponse.json({
    success: true,
    data: artists,
    pagination: {
      total: count || 0,
      limit: query.limit,
      offset: query.offset,
      page: Math.floor(query.offset / query.limit) + 1,
      totalPages: Math.ceil((count || 0) / query.limit),
    },
  });
});

// POST /api/v1/artists - Create new artist
export const POST = asyncHandler(async (req: Request) => {
  const nextReq = req as NextRequest;
  await rateLimit(nextReq, RateLimitPresets.write);
  await requireAuth(nextReq);

  const supabase = await createClient();

  // Parse and validate request body
  const body = await nextReq.json();
  const validatedData = createArtistSchema.parse(body);

  // Create artist - map camelCase to snake_case
  const { data: artist, error } = await supabase
    .from('artists')
    .insert({
      name: validatedData.name,
      slug: validatedData.slug,
      bio: validatedData.bio,
      genre_tags: validatedData.genreTags,
      profile_image_url: validatedData.profileImageUrl,
      cover_image_url: validatedData.coverImageUrl,
      social_links: validatedData.socialLinks,
      booking_email: validatedData.bookingEmail,
      website_url: validatedData.websiteUrl,
      verified: validatedData.verified,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return NextResponse.json({
    success: true,
    data: artist,
    message: 'Artist created successfully',
  }, { status: 201 });
});
