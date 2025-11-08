import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { EventService } from '@/lib/services/event.service';
import { handleAPIError } from '@/lib/api/error-handler';
import { requireAuth } from '@/lib/api/middleware';
import { rateLimit, RateLimitPresets } from '@/lib/api/rate-limiter';
import { updateEventSchema } from '@/lib/validations/schemas';

// GET /api/v1/events/[id] - Get single event
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await rateLimit(req, RateLimitPresets.read);
    const { id } = await params;

    const supabase = await createClient();
    const eventService = new EventService(supabase);

    const event = await eventService.getEventById(id);

    return NextResponse.json({
      success: true,
      data: event,
    });
  } catch (error) {
    return handleAPIError(error, req.url);
  }
}

// POST /api/v1/events/[id] - Alternative update endpoint (for compatibility)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await rateLimit(req, RateLimitPresets.write);
    await requireAuth(req);
    const { id } = await params;

    const supabase = await createClient();
    const eventService = new EventService(supabase);

    const body = await req.json();
    const validatedData = updateEventSchema.parse(body);
    
    // Map camelCase to snake_case
    const updateData: any = {};
    if (validatedData.name) updateData.name = validatedData.name;
    if (validatedData.slug) updateData.slug = validatedData.slug;
    if (validatedData.description !== undefined) updateData.description = validatedData.description;
    if (validatedData.eventType) updateData.event_type = validatedData.eventType;
    if (validatedData.startDate) updateData.start_date = validatedData.startDate;
    if (validatedData.endDate !== undefined) updateData.end_date = validatedData.endDate;
    if (validatedData.venueName !== undefined) updateData.venue_name = validatedData.venueName;
    if (validatedData.venueAddress !== undefined) updateData.venue_address = validatedData.venueAddress;
    if (validatedData.ageRestriction !== undefined) updateData.age_restriction = validatedData.ageRestriction;
    if (validatedData.capacity !== undefined) updateData.capacity = validatedData.capacity;
    if (validatedData.status) updateData.status = validatedData.status;
    if (validatedData.heroImageUrl !== undefined) updateData.hero_image_url = validatedData.heroImageUrl;
    if (validatedData.heroVideoUrl !== undefined) updateData.hero_video_url = validatedData.heroVideoUrl;
    if (validatedData.metadata !== undefined) updateData.metadata = validatedData.metadata;

    const event = await eventService.updateEvent(id, updateData);

    return NextResponse.json({
      success: true,
      data: event,
      message: 'Event updated successfully',
    });
  } catch (error) {
    return handleAPIError(error, req.url);
  }
}

// PATCH /api/v1/events/[id] - Update event
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await rateLimit(req, RateLimitPresets.write);
    await requireAuth(req);
    const { id } = await params;

    const supabase = await createClient();
    const eventService = new EventService(supabase);

    const body = await req.json();
    const validatedData = updateEventSchema.parse(body);
    
    // Map camelCase to snake_case
    const updateData: any = {};
    if (validatedData.name) updateData.name = validatedData.name;
    if (validatedData.slug) updateData.slug = validatedData.slug;
    if (validatedData.description !== undefined) updateData.description = validatedData.description;
    if (validatedData.eventType) updateData.event_type = validatedData.eventType;
    if (validatedData.startDate) updateData.start_date = validatedData.startDate;
    if (validatedData.endDate !== undefined) updateData.end_date = validatedData.endDate;
    if (validatedData.venueName !== undefined) updateData.venue_name = validatedData.venueName;
    if (validatedData.venueAddress !== undefined) updateData.venue_address = validatedData.venueAddress;
    if (validatedData.ageRestriction !== undefined) updateData.age_restriction = validatedData.ageRestriction;
    if (validatedData.capacity !== undefined) updateData.capacity = validatedData.capacity;
    if (validatedData.status) updateData.status = validatedData.status;
    if (validatedData.heroImageUrl !== undefined) updateData.hero_image_url = validatedData.heroImageUrl;
    if (validatedData.heroVideoUrl !== undefined) updateData.hero_video_url = validatedData.heroVideoUrl;
    if (validatedData.metadata !== undefined) updateData.metadata = validatedData.metadata;

    const event = await eventService.updateEvent(id, updateData);

    return NextResponse.json({
      success: true,
      data: event,
      message: 'Event updated successfully',
    });
  } catch (error) {
    return handleAPIError(error, req.url);
  }
}

// DELETE /api/v1/events/[id] - Delete event
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await rateLimit(req, RateLimitPresets.write);
    await requireAuth(req);
    const { id } = await params;

    const supabase = await createClient();
    const eventService = new EventService(supabase);

    await eventService.deleteEvent(id);

    return NextResponse.json({
      success: true,
      message: 'Event deleted successfully',
    });
  } catch (error) {
    return handleAPIError(error, req.url);
  }
}
