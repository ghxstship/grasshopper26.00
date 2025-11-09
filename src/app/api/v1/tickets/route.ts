import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { asyncHandler } from '@/lib/api/error-handler';
import { requireAuth, parsePagination } from '@/lib/api/middleware';
import { rateLimit, RateLimitPresets } from '@/lib/api/rate-limiter';

export const GET = asyncHandler(async (req: Request) => {
  const nextReq = req as NextRequest;
  await rateLimit(nextReq, RateLimitPresets.read);
  const user = await requireAuth(nextReq);

  const supabase = await createClient();
  const searchParams = nextReq.nextUrl.searchParams;
  const pagination = parsePagination(nextReq);
  
  const orderId = searchParams.get('orderId');
  const status = searchParams.get('status');

  let queryBuilder = supabase
    .from('tickets')
    .select(`
      *,
      ticket_types (
        name,
        price,
        events (
          name,
          start_date,
          venue_name
        )
      ),
      orders!inner (
        user_id
      )
    `, { count: 'exact' })
    .eq('orders.user_id', user.id);

  if (orderId) {
    queryBuilder = queryBuilder.eq('order_id', orderId);
  }

  if (status) {
    queryBuilder = queryBuilder.eq('status', status);
  }

  queryBuilder = queryBuilder
    .order('created_at', { ascending: false })
    .range(pagination.offset, pagination.offset + pagination.limit - 1);

  const { data: tickets, error, count } = await queryBuilder;

  if (error) throw error;

  return NextResponse.json({
    success: true,
    data: tickets,
    pagination: {
      total: count || 0,
      limit: pagination.limit,
      offset: pagination.offset,
      page: pagination.page,
      totalPages: Math.ceil((count || 0) / pagination.limit),
    },
  });
});
