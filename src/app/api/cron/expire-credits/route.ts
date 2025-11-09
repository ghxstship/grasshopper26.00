/**
 * Cron Job: Expire Old Credits
 * Runs daily to expire credits that have passed their expiration date
 * 
 * Schedule: 0 2 * * * (Daily at 2 AM)
 * Vercel Cron: https://vercel.com/docs/cron-jobs
 */

import { NextRequest, NextResponse } from 'next/server';
import { expireOldCredits } from '@/lib/membership/credits';
import { expireOldVouchers } from '@/lib/membership/vouchers';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[CRON] Starting credit and voucher expiration...');
    
    const [expiredCredits, expiredVouchers] = await Promise.all([
      expireOldCredits(),
      expireOldVouchers(),
    ]);
    
    console.log(`[CRON] Expired ${expiredCredits} credits and ${expiredVouchers} vouchers`);

    return NextResponse.json({
      success: true,
      message: `Expired ${expiredCredits} credits and ${expiredVouchers} vouchers`,
      expired_credits: expiredCredits,
      expired_vouchers: expiredVouchers,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[CRON] Error expiring credits/vouchers:', error);
    
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
