/**
 * Cron Job: Send Renewal Reminders
 * Runs daily to send renewal reminders to members whose subscriptions are expiring soon
 * 
 * Schedule: 0 10 * * * (Daily at 10 AM)
 * Vercel Cron: https://vercel.com/docs/cron-jobs
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendRenewalReminderEmail } from '@/lib/email/send';
import { addDays, differenceInDays, format } from 'date-fns';

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

    console.log('[CRON] Starting renewal reminder process...');
    
    const supabase = await createClient();
    
    // Get memberships expiring in 7, 3, or 1 day(s)
    const REMINDER_DAYS = [7, 3, 1];
    const today = new Date();
    
    let remindersSent = 0;

    for (const days of REMINDER_DAYS) {
      const targetDate = addDays(today, days);
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0)).toISOString();
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999)).toISOString();

      const { data: memberships, error } = await supabase
        .from('user_memberships')
        .select(`
          id,
          user_id,
          renewal_date,
          membership_tiers (
            tier_name,
            annual_price,
            monthly_price
          ),
          profiles (
            email,
            display_name
          )
        `)
        .eq('status', 'active')
        .gte('renewal_date', startOfDay)
        .lte('renewal_date', endOfDay);

      if (error) {
        console.error(`[CRON] Error fetching memberships for ${days}-day reminder:`, error);
        continue;
      }

      if (!memberships || memberships.length === 0) {
        continue;
      }

      for (const membership of memberships) {
        try {
          const tierData = Array.isArray(membership.membership_tiers)
            ? membership.membership_tiers[0]
            : membership.membership_tiers;
          
          const profileData = Array.isArray(membership.profiles)
            ? membership.profiles[0]
            : membership.profiles;

          if (!profileData?.email || !tierData) {
            continue;
          }

          // Determine renewal amount (prefer annual, fallback to monthly)
          const amount = tierData.annual_price || tierData.monthly_price || 0;

          await sendRenewalReminderEmail({
            to: profileData.email,
            memberName: profileData.display_name || 'Member',
            tierName: tierData.tier_name || 'Member',
            renewalDate: format(new Date(membership.renewal_date), 'MMMM d, yyyy'),
            amount,
            daysUntilRenewal: days,
          });

          remindersSent++;
        } catch (error) {
          console.error(`[CRON] Error sending reminder for membership ${membership.id}:`, error);
        }
      }
    }
    
    console.log(`[CRON] Sent ${remindersSent} renewal reminders`);

    return NextResponse.json({
      success: true,
      message: `Sent ${remindersSent} renewal reminders`,
      reminders_sent: remindersSent,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[CRON] Error sending renewal reminders:', error);
    
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
