/**
 * VIP Upgrade Voucher System
 * Handles voucher generation, allocation, redemption, and tracking
 */

import { createClient } from '@/lib/supabase/server';
import { sendVipVoucherEmail } from '@/lib/email/send';
import { addMonths, format } from 'date-fns';

export interface VipVoucher {
  id: string;
  membership_id: string;
  voucher_code: string;
  status: 'active' | 'redeemed' | 'expired';
  event_id: string | null;
  redeemed_at: string | null;
  expires_at: string;
  created_at: string;
}

/**
 * Generate a unique voucher code
 */
function generateVoucherCode(): string {
  const prefix = 'VIP';
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude similar looking characters
  const length = 8;
  
  let code = prefix;
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return code;
}

/**
 * Check if voucher code is unique
 */
async function isVoucherCodeUnique(code: string): Promise<boolean> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('vip_upgrade_vouchers')
    .select('id')
    .eq('voucher_code', code)
    .single();
  
  return !data && error?.code === 'PGRST116'; // No rows returned
}

/**
 * Generate unique voucher code (with retry)
 */
async function generateUniqueVoucherCode(): Promise<string> {
  const MAX_RETRIES = 10;
  
  for (let i = 0; i < MAX_RETRIES; i++) {
    const code = generateVoucherCode();
    if (await isVoucherCodeUnique(code)) {
      return code;
    }
  }
  
  throw new Error('Failed to generate unique voucher code');
}

/**
 * Allocate VIP vouchers to a membership
 */
export async function allocateVouchers(
  membershipId: string,
  count: number,
  expirationMonths: number = 12
): Promise<VipVoucher[]> {
  const supabase = await createClient();
  const vouchers: VipVoucher[] = [];
  const expiresAt = addMonths(new Date(), expirationMonths);

  for (let i = 0; i < count; i++) {
    const voucherCode = await generateUniqueVoucherCode();
    
    const { data: voucher, error } = await supabase
      .from('vip_upgrade_vouchers')
      .insert({
        membership_id: membershipId,
        voucher_code: voucherCode,
        status: 'active',
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to allocate voucher: ${error.message}`);
    }

    vouchers.push(voucher);
  }

  // Update membership record
  const { error: updateError } = await supabase
    .from('user_memberships')
    .update({ 
      vip_upgrades_remaining: count 
    })
    .eq('id', membershipId);

  if (updateError) {
    throw new Error(`Failed to update membership vouchers: ${updateError.message}`);
  }

  return vouchers;
}

/**
 * Get active vouchers for a membership
 */
export async function getActiveVouchers(membershipId: string): Promise<VipVoucher[]> {
  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('vip_upgrade_vouchers')
    .select('*')
    .eq('membership_id', membershipId)
    .eq('status', 'active')
    .gt('expires_at', now)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to get active vouchers: ${error.message}`);
  }

  return data || [];
}

/**
 * Validate and get voucher by code
 */
export async function validateVoucher(voucherCode: string): Promise<VipVoucher | null> {
  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('vip_upgrade_vouchers')
    .select('*')
    .eq('voucher_code', voucherCode)
    .eq('status', 'active')
    .gt('expires_at', now)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to validate voucher: ${error.message}`);
  }

  return data || null;
}

/**
 * Redeem a voucher for a ticket upgrade
 */
export async function redeemVoucher(
  voucherCode: string,
  eventId: string,
  orderId: string
): Promise<VipVoucher> {
  const supabase = await createClient();

  // Validate voucher
  const voucher = await validateVoucher(voucherCode);
  if (!voucher) {
    throw new Error('Invalid or expired voucher');
  }

  // Mark as redeemed
  const { data: redeemedVoucher, error: redeemError } = await supabase
    .from('vip_upgrade_vouchers')
    .update({
      status: 'redeemed',
      event_id: eventId,
      redeemed_at: new Date().toISOString(),
    })
    .eq('id', voucher.id)
    .select()
    .single();

  if (redeemError) {
    throw new Error(`Failed to redeem voucher: ${redeemError.message}`);
  }

  // Update membership voucher count
  const { data: membership } = await supabase
    .from('user_memberships')
    .select('vip_upgrades_remaining')
    .eq('id', voucher.membership_id)
    .single();

  if (membership) {
    const remaining = Math.max(0, (membership.vip_upgrades_remaining || 0) - 1);
    
    await supabase
      .from('user_memberships')
      .update({ vip_upgrades_remaining: remaining })
      .eq('id', voucher.membership_id);
  }

  // Log benefit usage
  await supabase.from('membership_benefit_usage').insert({
    membership_id: voucher.membership_id,
    benefit_type: 'vip_upgrade',
    event_id: eventId,
    order_id: orderId,
    value_redeemed: 1,
  });

  return redeemedVoucher;
}

/**
 * Expire old vouchers (called by cron job)
 */
export async function expireOldVouchers(): Promise<number> {
  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data: expiredVouchers, error: fetchError } = await supabase
    .from('vip_upgrade_vouchers')
    .select('id, membership_id')
    .eq('status', 'active')
    .lt('expires_at', now);

  if (fetchError) {
    throw new Error(`Failed to fetch expired vouchers: ${fetchError.message}`);
  }

  if (!expiredVouchers || expiredVouchers.length === 0) {
    return 0;
  }

  // Mark vouchers as expired
  const voucherIds = expiredVouchers.map(v => v.id);
  
  const { error: updateError } = await supabase
    .from('vip_upgrade_vouchers')
    .update({ status: 'expired' })
    .in('id', voucherIds);

  if (updateError) {
    throw new Error(`Failed to expire vouchers: ${updateError.message}`);
  }

  // Update membership voucher counts
  const membershipCounts = new Map<string, number>();
  expiredVouchers.forEach(v => {
    membershipCounts.set(v.membership_id, (membershipCounts.get(v.membership_id) || 0) + 1);
  });

  for (const [membershipId, count] of membershipCounts) {
    const { data: membership } = await supabase
      .from('user_memberships')
      .select('vip_upgrades_remaining')
      .eq('id', membershipId)
      .single();

    if (membership) {
      const remaining = Math.max(0, (membership.vip_upgrades_remaining || 0) - count);
      
      await supabase
        .from('user_memberships')
        .update({ vip_upgrades_remaining: remaining })
        .eq('id', membershipId);
    }
  }

  return expiredVouchers.length;
}

/**
 * Send voucher allocation email to member
 */
export async function sendVoucherAllocationEmail(
  membershipId: string,
  voucherCode: string,
  voucherCount: number
): Promise<void> {
  const supabase = await createClient();

  // Get membership and profile data
  const { data: membership, error } = await supabase
    .from('user_memberships')
    .select(`
      id,
      profiles (
        email,
        display_name
      )
    `)
    .eq('id', membershipId)
    .single();

  if (error || !membership) {
    throw new Error('Failed to get membership data for email');
  }

  const profileData = Array.isArray(membership.profiles)
    ? membership.profiles[0]
    : membership.profiles;

  if (!profileData?.email) {
    throw new Error('No email address found for membership');
  }

  // Get voucher expiration
  const { data: voucher } = await supabase
    .from('vip_upgrade_vouchers')
    .select('expires_at')
    .eq('voucher_code', voucherCode)
    .single();

  const DEFAULT_EXPIRATION_MONTHS = 12;
  const expirationDate = voucher?.expires_at 
    ? format(new Date(voucher.expires_at), 'MMMM d, yyyy')
    : format(addMonths(new Date(), DEFAULT_EXPIRATION_MONTHS), 'MMMM d, yyyy');

  await sendVipVoucherEmail({
    to: profileData.email,
    memberName: profileData.display_name || 'Member',
    voucherCode,
    voucherCount,
    expirationDate,
  });
}

/**
 * Get voucher statistics for a membership
 */
export async function getVoucherStats(membershipId: string): Promise<{
  total: number;
  active: number;
  redeemed: number;
  expired: number;
}> {
  const supabase = await createClient();

  const { data: vouchers, error } = await supabase
    .from('vip_upgrade_vouchers')
    .select('status')
    .eq('membership_id', membershipId);

  if (error) {
    throw new Error(`Failed to get voucher stats: ${error.message}`);
  }

  const stats = {
    total: vouchers?.length || 0,
    active: 0,
    redeemed: 0,
    expired: 0,
  };

  vouchers?.forEach(v => {
    if (v.status === 'active') stats.active++;
    else if (v.status === 'redeemed') stats.redeemed++;
    else if (v.status === 'expired') stats.expired++;
  });

  return stats;
}
