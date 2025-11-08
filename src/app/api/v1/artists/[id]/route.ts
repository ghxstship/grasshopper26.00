import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { handleAPIError, ErrorResponses } from '@/lib/api/error-handler';
import { requireAuth } from '@/lib/api/middleware';
import { rateLimit, RateLimitPresets } from '@/lib/api/rate-limiter';
import { updateArtistSchema } from '@/lib/validations/schemas';

// GET /api/v1/artists/[id] - Get single artist
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await rateLimit(req, RateLimitPresets.read);
    const { id } = await params;

    const supabase = await createClient();

    const { data: artist, error } = await supabase
      .from('artists')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !artist) {
      throw ErrorResponses.notFound('Artist not found');
    }

    return NextResponse.json({
      success: true,
      data: artist,
    });
  } catch (error) {
    return handleAPIError(error, req.url);
  }
}

// PUT /api/v1/artists/[id] - Update artist
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await rateLimit(req, RateLimitPresets.write);
    await requireAuth(req);
    const { id } = await params;

    const supabase = await createClient();

    // Check if artist exists
    const { data: existingArtist, error: fetchError } = await supabase
      .from('artists')
      .select('id')
      .eq('id', id)
      .single();

    if (fetchError || !existingArtist) {
      throw ErrorResponses.notFound('Artist not found');
    }

    const body = await req.json();
    const validatedData = updateArtistSchema.parse(body);

    // Build update object - only include provided fields
    const updateData: any = {};
    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (validatedData.slug !== undefined) updateData.slug = validatedData.slug;
    if (validatedData.bio !== undefined) updateData.bio = validatedData.bio;
    if (validatedData.genreTags !== undefined) updateData.genre_tags = validatedData.genreTags;
    if (validatedData.profileImageUrl !== undefined) updateData.profile_image_url = validatedData.profileImageUrl;
    if (validatedData.coverImageUrl !== undefined) updateData.cover_image_url = validatedData.coverImageUrl;
    if (validatedData.socialLinks !== undefined) updateData.social_links = validatedData.socialLinks;
    if (validatedData.bookingEmail !== undefined) updateData.booking_email = validatedData.bookingEmail;
    if (validatedData.websiteUrl !== undefined) updateData.website_url = validatedData.websiteUrl;
    if (validatedData.verified !== undefined) updateData.verified = validatedData.verified;

    const { data: artist, error } = await supabase
      .from('artists')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: artist,
      message: 'Artist updated successfully',
    });
  } catch (error) {
    return handleAPIError(error, req.url);
  }
}

// PATCH /api/v1/artists/[id] - Partial update artist
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return PUT(req, { params });
}

// DELETE /api/v1/artists/[id] - Delete artist (soft delete)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await rateLimit(req, RateLimitPresets.write);
    await requireAuth(req);
    const { id } = await params;

    const supabase = await createClient();

    // Check if artist exists
    const { data: existingArtist, error: fetchError } = await supabase
      .from('artists')
      .select('id')
      .eq('id', id)
      .single();

    if (fetchError || !existingArtist) {
      throw ErrorResponses.notFound('Artist not found');
    }

    // Soft delete by setting deleted_at timestamp
    const { error } = await supabase
      .from('artists')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Artist deleted successfully',
    });
  } catch (error) {
    return handleAPIError(error, req.url);
  }
}
