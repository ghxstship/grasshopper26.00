import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { EventService } from '@/lib/services/event.service';
import { handleAPIError, asyncHandler } from '@/lib/api/error-handler';
import { requireAuth } from '@/lib/api/middleware';
import { rateLimit, RateLimitPresets } from '@/lib/api/rate-limiter';
import { z } from 'zod';

const batchOperationSchema = z.object({
  operations: z.array(
    z.object({
      action: z.enum(['create', 'update', 'delete']),
      id: z.string().uuid().optional(),
      data: z.any().optional(),
    })
  ).max(100, 'Maximum 100 operations per batch'),
});

interface BatchResult {
  id?: string;
  status: 'success' | 'error';
  error?: string;
}

/**
 * POST /api/v1/batch/events
 * Bulk create, update, or delete events
 * Maximum 100 operations per request
 */
export const POST = asyncHandler(async (req: Request) => {
  const nextReq = req as NextRequest;
  await rateLimit(nextReq, RateLimitPresets.write);
  const user = await requireAuth(nextReq);

  const supabase = await createClient();
  const eventService = new EventService(supabase);

  // Parse and validate request body
  const body = await nextReq.json();
  const { operations } = batchOperationSchema.parse(body);

  const results: BatchResult[] = [];
  let successful = 0;
  let failed = 0;

  // Process each operation sequentially to maintain data consistency
  for (const operation of operations) {
    try {
      let result: BatchResult;

      switch (operation.action) {
        case 'create':
          if (!operation.data) {
            throw new Error('Data required for create operation');
          }
          const created = await eventService.createEvent(operation.data);
          result = { id: created.id, status: 'success' };
          successful++;
          break;

        case 'update':
          if (!operation.id || !operation.data) {
            throw new Error('ID and data required for update operation');
          }
          await eventService.updateEvent(operation.id, operation.data);
          result = { id: operation.id, status: 'success' };
          successful++;
          break;

        case 'delete':
          if (!operation.id) {
            throw new Error('ID required for delete operation');
          }
          await eventService.deleteEvent(operation.id);
          result = { id: operation.id, status: 'success' };
          successful++;
          break;

        default:
          throw new Error(`Unknown action: ${operation.action}`);
      }

      results.push(result);
    } catch (error) {
      failed++;
      results.push({
        id: operation.id,
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
