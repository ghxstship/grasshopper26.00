import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { handleAPIError, asyncHandler } from '@/lib/api/error-handler';
import { requireAuth, parsePagination, parseSort } from '@/lib/api/middleware';
import { rateLimit, RateLimitPresets } from '@/lib/api/rate-limiter';
import { createProductSchema } from '@/lib/validations/schemas';

// GET /api/v1/products - List products with filtering
export const GET = asyncHandler(async (req: Request) => {
  const nextReq = req as NextRequest;
  await rateLimit(nextReq, RateLimitPresets.read);

  const supabase = await createClient();
  
  // Parse query parameters
  const searchParams = nextReq.nextUrl.searchParams;
  const pagination = parsePagination(nextReq);
  const sort = parseSort(nextReq, ['name', 'created_at', 'base_price'], 'created_at');
  
  const category = searchParams.get('category');
  const status = searchParams.get('status');
  const eventId = searchParams.get('eventId');
  const search = searchParams.get('search');

  // Build query
  let queryBuilder = supabase
    .from('products')
    .select('*', { count: 'exact' });

  // Apply filters
  if (category) {
    queryBuilder = queryBuilder.eq('category', category);
  }

  if (status) {
    queryBuilder = queryBuilder.eq('status', status);
  }

  if (eventId) {
    queryBuilder = queryBuilder.eq('event_id', eventId);
  }

  if (search) {
    queryBuilder = queryBuilder.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
  }

  // Apply sorting
  queryBuilder = queryBuilder.order(sort.sortBy, { ascending: sort.sortOrder === 'asc' });

  // Apply pagination
  queryBuilder = queryBuilder.range(pagination.offset, pagination.offset + pagination.limit - 1);

  const { data: products, error, count } = await queryBuilder;

  if (error) {
    throw error;
  }

  return NextResponse.json({
    success: true,
    data: products,
    pagination: {
      total: count || 0,
      limit: pagination.limit,
      offset: pagination.offset,
      page: pagination.page,
      totalPages: Math.ceil((count || 0) / pagination.limit),
    },
  });
});

// POST /api/v1/products - Create new product
export const POST = asyncHandler(async (req: Request) => {
  const nextReq = req as NextRequest;
  await rateLimit(nextReq, RateLimitPresets.write);
  await requireAuth(nextReq);

  const supabase = await createClient();

  // Parse and validate request body
  const body = await nextReq.json();
  const validatedData = createProductSchema.parse(body);

  // Create product - map camelCase to snake_case
  const { data: product, error } = await supabase
    .from('products')
    .insert({
      brand_id: validatedData.brandId,
      event_id: validatedData.eventId,
      name: validatedData.name,
      slug: validatedData.slug,
      description: validatedData.description,
      category: validatedData.category,
      base_price: validatedData.basePrice,
      images: validatedData.images,
      status: validatedData.status,
      variants: validatedData.variants,
      metadata: validatedData.metadata,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return NextResponse.json({
    success: true,
    data: product,
    message: 'Product created successfully',
  }, { status: 201 });
});
