import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { EventService } from '@/lib/services/event.service';
import { handleAPIError, asyncHandler } from '@/lib/api/error-handler';
import { requireAuth, parsePagination, parseSort, parseFilters } from '@/lib/api/middleware';
import { rateLimit, RateLimitPresets } from '@/lib/api/rate-limiter';
import { createEventSchema, updateEventSchema, queryEventsSchema } from '@/lib/validations/schemas';

// GET /api/v1/events - List events with filtering
export const GET = asyncHandler(async (req: Request) => {
  const nextReq = req as NextRequest;
  await rateLimit(nextReq, RateLimitPresets.read);

  const supabase = await createClient();
  const eventService = new EventService(supabase);

  // Parse query parameters
  const searchParams = nextReq.nextUrl.searchParams;
  const pagination = parsePagination(nextReq);
  const sort = parseSort(nextReq, ['start_date', 'created_at', 'name'], 'start_date');
  const filters = parseFilters(nextReq, ['brandId', 'status', 'startDate', 'endDate']);

  // Validate query params
  const query = queryEventsSchema.parse({
    ...filters,
    limit: pagination.limit,
    offset: pagination.offset,
    sortBy: sort.sortBy,
    sortOrder: sort.sortOrder,
  });

  const { events, total } = await eventService.listEvents(query);

  return NextResponse.json({
    success: true,
    data: events,
    pagination: {
      total,
      limit: pagination.limit,
      offset: pagination.offset,
      page: pagination.page,
      totalPages: Math.ceil(total / pagination.limit),
    },
  });
});

// POST /api/v1/events - Create new event
export const POST = asyncHandler(async (req: Request) => {
  const nextReq = req as NextRequest;
  await rateLimit(nextReq, RateLimitPresets.write);
  const user = await requireAuth(nextReq);

  const supabase = await createClient();
  const eventService = new EventService(supabase);

  // Parse and validate request body
  const body = await nextReq.json();
  const validatedData = createEventSchema.parse(body);

  // Create event - map camelCase to snake_case
  const event = await eventService.createEvent({
    brand_id: validatedData.brandId,
    name: validatedData.name,
    slug: validatedData.slug,
    description: validatedData.description,
    event_type: validatedData.eventType,
    start_date: validatedData.startDate,
    end_date: validatedData.endDate,
    venue_name: validatedData.venueName,
    venue_address: validatedData.venueAddress,
    age_restriction: validatedData.ageRestriction,
    capacity: validatedData.capacity,
    status: validatedData.status,
    hero_image_url: validatedData.heroImageUrl,
    hero_video_url: validatedData.heroVideoUrl,
    metadata: validatedData.metadata,
  });

  return NextResponse.json({
    success: true,
    data: event,
    message: 'Event created successfully',
  }, { status: 201 });
});
