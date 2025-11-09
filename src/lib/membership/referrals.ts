/**
 * Membership Referral System
 * Handles referral code generation, tracking, and reward distribution
 */

import { createClient } from '@/lib/supabase/server';
import { allocateCredits } from './credits';

export interface Referral {
  id: string;
  referrer_user_id: string;
  referred_user_id: string | null;
  referral_code: string;
  status: 'pending' | 'completed' | 'expired';
  reward_amount: number;
  created_at: string;
  completed_at: string | null;
}

export interface ReferralStats {
  total_referrals: number;
  completed_referrals: number;
  pending_referrals: number;
  total_rewards: number;
}

/**
 * Generate a unique referral code for a user
 */
function generateReferralCode(userId: string): string {
  const prefix = 'REF';
  const userHash = userId.substring(0, 4).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  
  return `${prefix}${userHash}${random}`;
}

/**
 * Check if referral code is unique
 */
async function isReferralCodeUnique(code: string): Promise<boolean> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('membership_referrals')
    .select('id')
    .eq('referral_code', code)
    .single();
  
  return !data && error?.code === 'PGRST116';
}

/**
 * Generate unique referral code (with retry)
 */
async function generateUniqueReferralCode(userId: string): Promise<string> {
  const MAX_RETRIES = 10;
  
  for (let i = 0; i < MAX_RETRIES; i++) {
    const code = generateReferralCode(userId);
    if (await isReferralCodeUnique(code)) {
      return code;
    }
  }
  
  throw new Error('Failed to generate unique referral code');
}

/**
 * Get or create referral code for a user
 */
export async function getUserReferralCode(userId: string): Promise<string> {
  const supabase = await createClient();

  // Check if user already has a referral code
  const { data: existingReferral } = await supabase
    .from('membership_referrals')
    .select('referral_code')
    .eq('referrer_user_id', userId)
    .eq('status', 'pending')
    .single();

  if (existingReferral) {
    return existingReferral.referral_code;
  }

  // Generate new referral code
  const referralCode = await generateUniqueReferralCode(userId);

  const { data: newReferral, error } = await supabase
    .from('membership_referrals')
    .insert({
      referrer_user_id: userId,
      referral_code: referralCode,
      status: 'pending',
      reward_amount: 0,
    })
    .select('referral_code')
    .single();

  if (error) {
    throw new Error(`Failed to create referral code: ${error.message}`);
  }

  return newReferral.referral_code;
}

/**
 * Validate referral code
 */
export async function validateReferralCode(code: string): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('membership_referrals')
    .select('id, status')
    .eq('referral_code', code)
    .eq('status', 'pending')
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to validate referral code: ${error.message}`);
  }

  return !!data;
}

/**
 * Apply referral code to a new signup
 */
export async function applyReferralCode(
  referralCode: string,
  newUserId: string
): Promise<Referral | null> {
  const supabase = await createClient();

  // Get the referral
  const { data: referral, error: fetchError } = await supabase
    .from('membership_referrals')
    .select('*')
    .eq('referral_code', referralCode)
    .eq('status', 'pending')
    .single();

  if (fetchError || !referral) {
    return null;
  }

  // Prevent self-referral
  if (referral.referrer_user_id === newUserId) {
    throw new Error('Cannot refer yourself');
  }

  // Update referral with referred user
  const { data: updatedReferral, error: updateError } = await supabase
    .from('membership_referrals')
    .update({
      referred_user_id: newUserId,
      status: 'completed',
      completed_at: new Date().toISOString(),
    })
    .eq('id', referral.id)
    .select()
    .single();

  if (updateError) {
    throw new Error(`Failed to apply referral code: ${updateError.message}`);
  }

  return updatedReferral;
}

/**
 * Award referral bonus to referrer
 */
export async function awardReferralBonus(
  referralId: string,
  bonusCredits: number = 2
): Promise<void> {
  const supabase = await createClient();

  // Get referral details
  const { data: referral, error: fetchError } = await supabase
    .from('membership_referrals')
    .select('referrer_user_id, referred_user_id')
    .eq('id', referralId)
    .single();

  if (fetchError || !referral) {
    throw new Error('Referral not found');
  }

  // Get referrer's membership
  const { data: membership, error: membershipError } = await supabase
    .from('user_memberships')
    .select('id')
    .eq('user_id', referral.referrer_user_id)
    .eq('status', 'active')
    .single();

  if (membershipError || !membership) {
    throw new Error('Referrer membership not found');
  }

  // Allocate bonus credits
  await allocateCredits(
    membership.id,
    bonusCredits,
    12, // 12 months expiration
    `Referral bonus for referring user ${referral.referred_user_id}`
  );

  // Update referral reward amount
  await supabase
    .from('membership_referrals')
    .update({ reward_amount: bonusCredits })
    .eq('id', referralId);
}

/**
 * Get referral statistics for a user
 */
export async function getReferralStats(userId: string): Promise<ReferralStats> {
  const supabase = await createClient();

  const { data: referrals, error } = await supabase
    .from('membership_referrals')
    .select('status, reward_amount')
    .eq('referrer_user_id', userId);

  if (error) {
    throw new Error(`Failed to get referral stats: ${error.message}`);
  }

  const stats: ReferralStats = {
    total_referrals: referrals?.length || 0,
    completed_referrals: 0,
    pending_referrals: 0,
    total_rewards: 0,
  };

  referrals?.forEach(ref => {
    if (ref.status === 'completed') {
      stats.completed_referrals++;
      stats.total_rewards += ref.reward_amount || 0;
    } else if (ref.status === 'pending') {
      stats.pending_referrals++;
    }
  });

  return stats;
}

/**
 * Get referral history for a user
 */
export async function getReferralHistory(
  userId: string,
  limit: number = 50
): Promise<Referral[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('membership_referrals')
    .select('*')
    .eq('referrer_user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to get referral history: ${error.message}`);
  }

  return data || [];
}

/**
 * Get referral leaderboard (top referrers)
 */
export async function getReferralLeaderboard(limit: number = 10): Promise<Array<{
  user_id: string;
  referral_count: number;
  total_rewards: number;
}>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('membership_referrals')
    .select('referrer_user_id, reward_amount')
    .eq('status', 'completed');

  if (error) {
    throw new Error(`Failed to get referral leaderboard: ${error.message}`);
  }

  // Aggregate by user
  const userStats = new Map<string, { count: number; rewards: number }>();
  
  data?.forEach(ref => {
    const current = userStats.get(ref.referrer_user_id) || { count: 0, rewards: 0 };
    userStats.set(ref.referrer_user_id, {
      count: current.count + 1,
      rewards: current.rewards + (ref.reward_amount || 0),
    });
  });

  // Convert to array and sort
  const leaderboard = Array.from(userStats.entries())
    .map(([user_id, stats]) => ({
      user_id,
      referral_count: stats.count,
      total_rewards: stats.rewards,
    }))
    .sort((a, b) => b.referral_count - a.referral_count)
    .slice(0, limit);

  return leaderboard;
}

/**
 * Generate referral link for a user
 */
export async function generateReferralLink(userId: string): Promise<string> {
  const referralCode = await getUserReferralCode(userId);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  return `${appUrl}/signup?ref=${referralCode}`;
}

/**
 * Track referral conversion (when referred user completes signup)
 */
export async function trackReferralConversion(
  referralCode: string,
  newUserId: string,
  membershipTierId: string
): Promise<void> {
  // Apply the referral code
  const referral = await applyReferralCode(referralCode, newUserId);
  
  if (!referral) {
    return; // Invalid or expired referral code
  }

  // Award bonus to referrer
  const DEFAULT_BONUS_CREDITS = 2;
  await awardReferralBonus(referral.id, DEFAULT_BONUS_CREDITS);
}
