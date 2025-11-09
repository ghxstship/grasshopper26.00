/**
 * Cron Job: Churn Prevention
 * Runs weekly to identify at-risk members and send engagement emails
 * 
 * Schedule: 0 9 * * 1 (Every Monday at 9 AM)
 * Vercel Cron: https://vercel.com/docs/cron-jobs
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { subDays } from 'date-fns';

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

    console.log('[CRON] Starting churn prevention analysis...');
    
    const supabase = await createClient();
    
    // Identify at-risk members:
    // 1. Haven't used credits in 60 days
    // 2. Haven't attended an event in 90 days
    // 3. Haven't logged in in 30 days
    
    const DAYS_THRESHOLD = {
      NO_CREDIT_USE: 60,
      NO_EVENT_ATTENDANCE: 90,
      NO_LOGIN: 30,
    };

    const thresholdDate = subDays(new Date(), DAYS_THRESHOLD.NO_LOGIN).toISOString();

    // Get potentially at-risk memberships
    const { data: memberships, error } = await supabase
      .from('user_memberships')
      .select(`
        id,
        user_id,
        ticket_credits_remaining,
        events_attended,
        profiles (
          email,
          display_name,
          last_sign_in_at
        )
      `)
      .eq('status', 'active')
      .gt('ticket_credits_remaining', 0); // Has unused credits

    if (error) {
      throw new Error(`Failed to fetch memberships: ${error.message}`);
    }

    if (!memberships || memberships.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No at-risk members identified',
        at_risk_count: 0,
        timestamp: new Date().toISOString(),
      });
    }

    let atRiskCount = 0;
    const atRiskMembers: string[] = [];

    for (const membership of memberships) {
      try {
        const profileData = Array.isArray(membership.profiles)
          ? membership.profiles[0]
          : membership.profiles;

        if (!profileData?.email) {
          continue;
        }

        // Check last login
        const lastLogin = profileData.last_sign_in_at 
          ? new Date(profileData.last_sign_in_at)
          : null;

        const isInactive = !lastLogin || lastLogin < new Date(thresholdDate);

        // Check credit usage
        const { data: recentCreditUse } = await supabase
          .from('ticket_credits_ledger')
          .select('id')
          .eq('membership_id', membership.id)
          .eq('transaction_type', 'redemption')
          .gte('created_at', subDays(new Date(), DAYS_THRESHOLD.NO_CREDIT_USE).toISOString())
          .limit(1);

        const hasRecentCreditUse = recentCreditUse && recentCreditUse.length > 0;

        // If inactive and no recent credit use, mark as at-risk
        if (isInactive && !hasRecentCreditUse && membership.ticket_credits_remaining > 0) {
          atRiskMembers.push(membership.id);
          atRiskCount++;

          // TODO: Send engagement email
          // This could include:
          // - Reminder about unused credits
          // - Upcoming events they might like
          // - Special member-only offers
          // - Survey about their experience
        }
      } catch (error) {
        console.error(`[CRON] Error analyzing membership ${membership.id}:`, error);
      }
    }
    
    console.log(`[CRON] Identified ${atRiskCount} at-risk members`);

    return NextResponse.json({
      success: true,
      message: `Identified ${atRiskCount} at-risk members`,
      at_risk_count: atRiskCount,
      at_risk_members: atRiskMembers,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[CRON] Error in churn prevention:', error);
    
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
