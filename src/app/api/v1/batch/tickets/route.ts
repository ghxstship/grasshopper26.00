import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { handleAPIError, asyncHandler } from '@/lib/api/error-handler';
import { requireAuth } from '@/lib/api/middleware';
import { rateLimit, RateLimitPresets } from '@/lib/api/rate-limiter';
import { z } from 'zod';

const batchTicketOperationSchema = z.object({
  operations: z.array(
    z.object({
      action: z.enum(['validate', 'invalidate', 'transfer']),
      ticketId: z.string().uuid(),
      transferTo: z.string().uuid().optional(),
    })
  ).max(100, 'Maximum 100 operations per batch'),
});

interface BatchTicketResult {
  ticketId: string;
  status: 'success' | 'error';
  error?: string;
}

/**
 * POST /api/v1/batch/tickets
 * Bulk ticket operations: validate, invalidate, or transfer
 * Maximum 100 operations per request
 */
export const POST = asyncHandler(async (req: Request) => {
  const nextReq = req as NextRequest;
  await rateLimit(nextReq, RateLimitPresets.write);
  const user = await requireAuth(nextReq);

  const supabase = await createClient();

  // Parse and validate request body
  const body = await nextReq.json();
  const { operations } = batchTicketOperationSchema.parse(body);

  const results: BatchTicketResult[] = [];
  let successful = 0;
  let failed = 0;

  // Process each operation sequentially
  for (const operation of operations) {
    try {
      let result: BatchTicketResult;

      switch (operation.action) {
        case 'validate':
          // Mark ticket as validated/used
          const { error: validateError } = await supabase
            .from('tickets')
            .update({ 
              status: 'used',
              validated_at: new Date().toISOString(),
              validated_by: user.id,
            })
            .eq('id', operation.ticketId);

          if (validateError) throw validateError;
          result = { ticketId: operation.ticketId, status: 'success' };
          successful++;
          break;

        case 'invalidate':
          // Mark ticket as invalid/cancelled
          const { error: invalidateError } = await supabase
            .from('tickets')
            .update({ 
              status: 'cancelled',
              cancelled_at: new Date().toISOString(),
            })
            .eq('id', operation.ticketId);

          if (invalidateError) throw invalidateError;
          result = { ticketId: operation.ticketId, status: 'success' };
          successful++;
          break;

        case 'transfer':
          if (!operation.transferTo) {
            throw new Error('transferTo required for transfer operation');
          }

          // Transfer ticket to new owner
          const { error: transferError } = await supabase
            .from('tickets')
            .update({ 
              user_id: operation.transferTo,
              transferred_at: new Date().toISOString(),
              transferred_from: user.id,
            })
            .eq('id', operation.ticketId)
            .eq('user_id', user.id); // Ensure user owns the ticket

          if (transferError) throw transferError;
          result = { ticketId: operation.ticketId, status: 'success' };
          successful++;
          break;

        default:
          throw new Error(`Unknown action: ${operation.action}`);
      }

      results.push(result);
    } catch (error) {
      failed++;
      results.push({
        ticketId: operation.ticketId,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return NextResponse.json({
    success: failed === 0,
    results,
    summary: {
      total: operations.length,
      successful,
      failed,
    },
  });
});
