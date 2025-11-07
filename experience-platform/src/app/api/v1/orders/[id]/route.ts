import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { OrderService } from '@/lib/services/order.service';
import { handleAPIError } from '@/lib/api/error-handler';
import { requireAuth } from '@/lib/api/middleware';
import { rateLimit, RateLimitPresets } from '@/lib/api/rate-limiter';

// GET /api/v1/orders/[id] - Get order details
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await rateLimit(req, RateLimitPresets.read);
    const { id } = await params;
    const user = await requireAuth(req);

    const supabase = await createClient();
    const orderService = new OrderService(supabase);

    const order = await orderService.getOrderById(id, user.id);

    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (error) {
    return handleAPIError(error, req.url);
  }
}

// PATCH /api/v1/orders/[id] - Update order status
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await rateLimit(req, RateLimitPresets.write);
    const user = await requireAuth(req);
    const { id } = await params;

    const supabase = await createClient();
    const orderService = new OrderService(supabase);

    const { status } = await req.json();
    const order = await orderService.updateOrderStatus(id, status);

    return NextResponse.json({
      success: true,
      data: order,
      message: 'Order updated successfully',
    });
  } catch (error) {
    return handleAPIError(error, req.url);
  }
}

// DELETE /api/v1/orders/[id] - Cancel order
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await rateLimit(req, RateLimitPresets.write);
    const user = await requireAuth(req);
    const { id } = await params;

    const supabase = await createClient();
    const orderService = new OrderService(supabase);

    const order = await orderService.cancelOrder(id, user.id);

    return NextResponse.json({
      success: true,
      data: order,
      message: 'Order cancelled successfully',
    });
  } catch (error) {
    return handleAPIError(error, req.url);
  }
}
