/**
 * Membership Credit System
 * Handles ticket credit allocation, redemption, expiration, and ledger tracking
 */

import { createClient } from '@/lib/supabase/server';
import { sendCreditAllocationEmail } from '@/lib/email/send';
import { addMonths, format } from 'date-fns';

export interface CreditTransaction {
  id: string;
  membership_id: string;
  transaction_type: 'allocation' | 'redemption' | 'expiration' | 'adjustment' | 'bonus';
  credits_change: number;
  credits_balance: number;
  expires_at: string | null;
  notes: string | null;
  created_at: string;
}

export interface CreditBalance {
  total: number;
  expiring_soon: number;
  expired: number;
}

/**
 * Get credit balance for a membership
 */
export async function getCreditBalance(membershipId: string): Promise<CreditBalance> {
  const supabase = await createClient();
  
  // Get the latest balance from ledger
  const { data: latestEntry, error: ledgerError } = await supabase
    .from('ticket_credits_ledger')
    .select('credits_balance')
    .eq('membership_id', membershipId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (ledgerError && ledgerError.code !== 'PGRST116') {
    throw new Error(`Failed to get credit balance: ${ledgerError.message}`);
  }

  const total = latestEntry?.credits_balance || 0;

  // Get credits expiring in next 30 days
  const EXPIRING_SOON_DAYS = 30;
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + EXPIRING_SOON_DAYS);

  const { data: expiringSoon, error: expiringError } = await supabase
    .from('ticket_credits_ledger')
    .select('credits_change')
    .eq('membership_id', membershipId)
    .eq('transaction_type', 'allocation')
    .gte('expires_at', new Date().toISOString())
    .lte('expires_at', thirtyDaysFromNow.toISOString());

  if (expiringError) {
    throw new Error(`Failed to get expiring credits: ${expiringError.message}`);
  }

  const expiringSoonTotal = expiringSoon?.reduce((sum, entry) => sum + entry.credits_change, 0) || 0;

  return {
    total,
    expiring_soon: expiringSoonTotal,
    expired: 0, // Expired credits are already removed from balance
  };
}

/**
 * Allocate credits to a membership
 */
export async function allocateCredits(
  membershipId: string,
  credits: number,
  expirationMonths: number = 12,
  notes?: string
): Promise<CreditTransaction> {
  const supabase = await createClient();

  // Get current balance
  const currentBalance = await getCreditBalance(membershipId);
  const newBalance = currentBalance.total + credits;

  // Calculate expiration date
  const expiresAt = addMonths(new Date(), expirationMonths);

  // Insert into ledger
  const { data: transaction, error: insertError } = await supabase
    .from('ticket_credits_ledger')
    .insert({
      membership_id: membershipId,
      transaction_type: 'allocation',
      credits_change: credits,
      credits_balance: newBalance,
      expires_at: expiresAt.toISOString(),
      notes: notes || 'Quarterly credit allocation',
    })
    .select()
    .single();

  if (insertError) {
    throw new Error(`Failed to allocate credits: ${insertError.message}`);
  }

  // Update membership record
  const { error: updateError } = await supabase
    .from('user_memberships')
    .update({ ticket_credits_remaining: newBalance })
    .eq('id', membershipId);

  if (updateError) {
    throw new Error(`Failed to update membership credits: ${updateError.message}`);
  }

  return transaction;
}

/**
 * Redeem credits for a ticket purchase
 */
export async function redeemCredits(
  membershipId: string,
  credits: number,
  orderId: string,
  eventId: string
): Promise<CreditTransaction> {
  const supabase = await createClient();

  // Get current balance
  const currentBalance = await getCreditBalance(membershipId);

  if (currentBalance.total < credits) {
    throw new Error('Insufficient credits');
  }

  const newBalance = currentBalance.total - credits;

  // Insert into ledger
  const { data: transaction, error: insertError } = await supabase
    .from('ticket_credits_ledger')
    .insert({
      membership_id: membershipId,
      transaction_type: 'redemption',
      credits_change: -credits,
      credits_balance: newBalance,
      expires_at: null,
      notes: `Redeemed for order ${orderId}`,
    })
    .select()
    .single();

  if (insertError) {
    throw new Error(`Failed to redeem credits: ${insertError.message}`);
  }

  // Update membership record
  const { error: updateError } = await supabase
    .from('user_memberships')
    .update({ ticket_credits_remaining: newBalance })
    .eq('id', membershipId);

  if (updateError) {
    throw new Error(`Failed to update membership credits: ${updateError.message}`);
  }

  // Log benefit usage
  await supabase.from('membership_benefit_usage').insert({
    membership_id: membershipId,
    benefit_type: 'ticket_credit',
    event_id: eventId,
    order_id: orderId,
    value_redeemed: credits,
  });

  return transaction;
}

/**
 * Expire old credits (called by cron job)
 */
export async function expireOldCredits(): Promise<number> {
  const supabase = await createClient();
  const now = new Date().toISOString();

  // Find all credits that have expired
  const { data: expiredCredits, error: fetchError } = await supabase
    .from('ticket_credits_ledger')
    .select('membership_id, credits_change, expires_at')
    .eq('transaction_type', 'allocation')
    .lt('expires_at', now)
    .is('expired', false);

  if (fetchError) {
    throw new Error(`Failed to fetch expired credits: ${fetchError.message}`);
  }

  if (!expiredCredits || expiredCredits.length === 0) {
    return 0;
  }

  let expiredCount = 0;

  // Process each expired credit allocation
  for (const credit of expiredCredits) {
    const currentBalance = await getCreditBalance(credit.membership_id);
    const creditsToExpire = Math.min(credit.credits_change, currentBalance.total);

    if (creditsToExpire > 0) {
      const newBalance = currentBalance.total - creditsToExpire;

      // Insert expiration transaction
      await supabase.from('ticket_credits_ledger').insert({
        membership_id: credit.membership_id,
        transaction_type: 'expiration',
        credits_change: -creditsToExpire,
        credits_balance: newBalance,
        expires_at: null,
        notes: `Credits expired from ${credit.expires_at}`,
      });

      // Update membership record
      await supabase
        .from('user_memberships')
        .update({ ticket_credits_remaining: newBalance })
        .eq('id', credit.membership_id);

      expiredCount++;
    }
  }

  return expiredCount;
}

/**
 * Allocate quarterly credits to all active memberships (called by cron job)
 */
export async function allocateQuarterlyCredits(): Promise<number> {
  const supabase = await createClient();

  // Get all active memberships with their tier information
  const { data: memberships, error: fetchError } = await supabase
    .from('user_memberships')
    .select(`
      id,
      user_id,
      tier_id,
      status,
      membership_tiers (
        tier_name,
        benefits
      ),
      profiles (
        email,
        display_name
      )
    `)
    .eq('status', 'active')
    .not('tier_id', 'is', null);

  if (fetchError) {
    throw new Error(`Failed to fetch memberships: ${fetchError.message}`);
  }

  if (!memberships || memberships.length === 0) {
    return 0;
  }

  let allocatedCount = 0;

  for (const membership of memberships) {
    try {
      // Get tier data (handle array or single object)
      const tierData = Array.isArray(membership.membership_tiers) 
        ? membership.membership_tiers[0] 
        : membership.membership_tiers;
      
      // Get credit allocation from tier benefits
      const benefits = tierData?.benefits as any;
      const quarterlyCredits = benefits?.quarterly_credits || 0;

      if (quarterlyCredits > 0) {
        const CREDIT_EXPIRATION_MONTHS = 12;
        
        // Allocate credits
        await allocateCredits(
          membership.id,
          quarterlyCredits,
          CREDIT_EXPIRATION_MONTHS,
          'Quarterly credit allocation'
        );

        // Send email notification
        const profileData = Array.isArray(membership.profiles)
          ? membership.profiles[0]
          : membership.profiles;
          
        if (profileData?.email) {
          const currentBalance = await getCreditBalance(membership.id);
          
          await sendCreditAllocationEmail({
            to: profileData.email,
            memberName: profileData.display_name || 'Member',
            tierName: tierData?.tier_name || 'Member',
            creditsAdded: quarterlyCredits,
            totalCredits: currentBalance.total,
            expirationDate: format(addMonths(new Date(), CREDIT_EXPIRATION_MONTHS), 'MMMM d, yyyy'),
          });
        }

        allocatedCount++;
      }
    } catch (error) {
      console.error(`Failed to allocate credits for membership ${membership.id}:`, error);
      // Continue with next membership
    }
  }

  return allocatedCount;
}

/**
 * Manually adjust credits (admin function)
 */
export async function adjustCredits(
  membershipId: string,
  credits: number,
  reason: string,
  adminId: string
): Promise<CreditTransaction> {
  const supabase = await createClient();

  const currentBalance = await getCreditBalance(membershipId);
  const newBalance = currentBalance.total + credits;

  if (newBalance < 0) {
    throw new Error('Cannot adjust credits below zero');
  }

  const CREDIT_EXPIRATION_MONTHS = 12;
  
  // Insert into ledger
  const { data: transaction, error: insertError } = await supabase
    .from('ticket_credits_ledger')
    .insert({
      membership_id: membershipId,
      transaction_type: 'adjustment',
      credits_change: credits,
      credits_balance: newBalance,
      expires_at: credits > 0 ? addMonths(new Date(), CREDIT_EXPIRATION_MONTHS).toISOString() : null,
      notes: `Admin adjustment by ${adminId}: ${reason}`,
    })
    .select()
    .single();

  if (insertError) {
    throw new Error(`Failed to adjust credits: ${insertError.message}`);
  }

  // Update membership record
  const { error: updateError } = await supabase
    .from('user_memberships')
    .update({ ticket_credits_remaining: newBalance })
    .eq('id', membershipId);

  if (updateError) {
    throw new Error(`Failed to update membership credits: ${updateError.message}`);
  }

  return transaction;
}

/**
 * Get credit transaction history
 */
export async function getCreditHistory(
  membershipId: string,
  limit: number = 50
): Promise<CreditTransaction[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('ticket_credits_ledger')
    .select('*')
    .eq('membership_id', membershipId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to get credit history: ${error.message}`);
  }

  return data || [];
}

/**
 * Check if membership has sufficient credits
 */
export async function hasCredits(membershipId: string, required: number): Promise<boolean> {
  const balance = await getCreditBalance(membershipId);
  return balance.total >= required;
}
