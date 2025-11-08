import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { handleAPIError, ErrorResponses } from '@/lib/api/error-handler';
import { requireAuth } from '@/lib/api/middleware';
import { rateLimit, RateLimitPresets } from '@/lib/api/rate-limiter';
import { z } from 'zod';

// Update product schema (partial of create schema)
const updateProductSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().min(10).optional(),
  category: z.enum(['apparel', 'accessories', 'collectibles', 'digital', 'other']).optional(),
  basePrice: z.number().nonnegative().optional(),
  images: z.array(z.string().url()).optional(),
  status: z.enum(['draft', 'active', 'archived']).optional(),
  variants: z.array(z.object({
    name: z.string().min(1),
    sku: z.string().min(1),
    price: z.number().nonnegative().optional(),
    stockQuantity: z.number().int().nonnegative().optional(),
    attributes: z.record(z.string()).optional(),
  })).optional(),
  metadata: z.record(z.any()).optional(),
});

// GET /api/v1/products/[id] - Get single product
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await rateLimit(req, RateLimitPresets.read);
    const { id } = await params;

    const supabase = await createClient();

    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !product) {
      throw ErrorResponses.notFound('Product not found');
    }

    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (error) {
    return handleAPIError(error, req.url);
  }
}

// PUT /api/v1/products/[id] - Update product
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await rateLimit(req, RateLimitPresets.write);
    await requireAuth(req);
    const { id } = await params;

    const supabase = await createClient();

    // Check if product exists
    const { data: existingProduct, error: fetchError } = await supabase
      .from('products')
      .select('id')
      .eq('id', id)
      .single();

    if (fetchError || !existingProduct) {
      throw ErrorResponses.notFound('Product not found');
    }

    const body = await req.json();
    const validatedData = updateProductSchema.parse(body);

    // Build update object - only include provided fields
    const updateData: any = {};
    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (validatedData.slug !== undefined) updateData.slug = validatedData.slug;
    if (validatedData.description !== undefined) updateData.description = validatedData.description;
    if (validatedData.category !== undefined) updateData.category = validatedData.category;
    if (validatedData.basePrice !== undefined) updateData.base_price = validatedData.basePrice;
    if (validatedData.images !== undefined) updateData.images = validatedData.images;
    if (validatedData.status !== undefined) updateData.status = validatedData.status;
    if (validatedData.variants !== undefined) updateData.variants = validatedData.variants;
    if (validatedData.metadata !== undefined) updateData.metadata = validatedData.metadata;

    const { data: product, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: product,
      message: 'Product updated successfully',
    });
  } catch (error) {
    return handleAPIError(error, req.url);
  }
}

// PATCH /api/v1/products/[id] - Partial update product
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return PUT(req, { params });
}

// DELETE /api/v1/products/[id] - Delete product (soft delete)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await rateLimit(req, RateLimitPresets.write);
    await requireAuth(req);
    const { id } = await params;

    const supabase = await createClient();

    // Check if product exists
    const { data: existingProduct, error: fetchError } = await supabase
      .from('products')
      .select('id')
      .eq('id', id)
      .single();

    if (fetchError || !existingProduct) {
      throw ErrorResponses.notFound('Product not found');
    }

    // Soft delete by setting status to archived
    const { error } = await supabase
      .from('products')
      .update({ 
        status: 'archived',
        deleted_at: new Date().toISOString() 
      })
      .eq('id', id);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    return handleAPIError(error, req.url);
  }
}
