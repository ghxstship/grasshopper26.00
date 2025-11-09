/**
 * Cron Job: Allocate Quarterly Credits
 * Runs quarterly to allocate ticket credits to active memberships
 * 
 * Schedule: 0 0 1 1,4,7,10 * (First day of Jan, Apr, Jul, Oct at midnight)
 * Vercel Cron: https://vercel.com/docs/cron-jobs
 */

import { NextRequest, NextResponse } from 'next/server';
import { allocateQuarterlyCredits } from '@/lib/membership/credits';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[CRON] Starting quarterly credit allocation...');
    
    const allocatedCount = await allocateQuarterlyCredits();
    
    console.log(`[CRON] Allocated credits to ${allocatedCount} memberships`);

    return NextResponse.json({
      success: true,
      message: `Allocated credits to ${allocatedCount} memberships`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[CRON] Error allocating credits:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
