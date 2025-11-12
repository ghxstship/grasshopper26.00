/**
 * Admin User Management System
 * Manage users, memberships, credits, and vouchers
 */

import { createClient } from '@/lib/supabase/server';
import { allocateCredits, adjustCredits } from '../membership/credits';
import { allocateVouchers } from '../membership/vouchers';

export interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  created_at: string;
  last_sign_in_at: string;
  membership_status?: string;
  membership_tier?: string;
}

/**
 * Search users
 */
export async function searchUsers(query: string, limit: number = 50): Promise<UserProfile[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('profiles')
    .select(`
      id,
      email,
      display_name,
      created_at,
      last_sign_in_at,
      user_memberships (
        status,
        membership_tiers (tier_name)
      )
    `)
    .or(`email.ilike.%${query}%,display_name.ilike.%${query}%`)
    .limit(limit);

  if (error) {
    throw new Error(`Failed to search users: ${error.message}`);
  }

  return data?.map(user => {
    const membershipData = Array.isArray(user.user_memberships) && user.user_memberships.length > 0
      ? user.user_memberships[0]
      : null;
    
    const tierData = membershipData?.membership_tiers;
    let tierName: string | undefined;
    
    if (Array.isArray(tierData) && tierData.length > 0) {
      tierName = tierData[0]?.tier_name;
    } else if (tierData && typeof tierData === 'object') {
      tierName = (tierData as any).tier_name;
    }

    return {
      id: user.id,
      email: user.email,
      display_name: user.display_name,
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at,
      membership_status: membershipData?.status,
      membership_tier: tierName,
    };
  }) || [];
}

/**
 * Get user details
 */
export async function getUserDetails(userId: string): Promise<any> {
  const supabase = await createClient();

  const { data: user, error } = await supabase
    .from('profiles')
    .select(`
      *,
      user_memberships (
        *,
        membership_tiers (*)
      ),
      tickets (
        *,
        events (title, start_date)
      ),
      orders (
        *
      )
    `)
    .eq('id', userId)
    .single();

  if (error) {
    throw new Error(`Failed to get user details: ${error.message}`);
  }

  return user;
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  data: {
    display_name?: string;
    bio?: string;
    avatar_url?: string;
  }
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('profiles')
    .update(data)
    .eq('id', userId);

  if (error) {
    throw new Error(`Failed to update user profile: ${error.message}`);
  }
}

/**
 * Manually allocate credits to user
 */
export async function manualAllocateCredits(
  userId: string,
  credits: number,
  reason: string,
  adminId: string
): Promise<void> {
  const supabase = await createClient();

  // Get user's active membership
  const { data: membership, error: membershipError } = await supabase
    .from('user_memberships')
    .select('id')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();

  if (membershipError || !membership) {
    throw new Error('User does not have an active membership');
  }

  const CREDIT_EXPIRATION_MONTHS = 12;
  await allocateCredits(membership.id, credits, CREDIT_EXPIRATION_MONTHS, `Admin allocation: ${reason}`);
  
  // Log admin action
  await supabase.from('admin_actions').insert({
    admin_id: adminId,
    action_type: 'allocate_credits',
    target_user_id: userId,
    details: { credits, reason },
    created_at: new Date().toISOString(),
  });
}

/**
 * Manually adjust credits
 */
export async function manualAdjustCredits(
  userId: string,
  adjustment: number,
  reason: string,
  adminId: string
): Promise<void> {
  const supabase = await createClient();

  // Get user's active membership
  const { data: membership, error: membershipError } = await supabase
    .from('user_memberships')
    .select('id')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();

  if (membershipError || !membership) {
    throw new Error('User does not have an active membership');
  }

  await adjustCredits(membership.id, adjustment, reason, adminId);
  
  // Log admin action
  await supabase.from('admin_actions').insert({
    admin_id: adminId,
    action_type: 'adjust_credits',
    target_user_id: userId,
    details: { adjustment, reason },
    created_at: new Date().toISOString(),
  });
}

/**
 * Manually allocate VIP vouchers
 */
export async function manualAllocateVouchers(
  userId: string,
  count: number,
  reason: string,
  adminId: string
): Promise<void> {
  const supabase = await createClient();

  // Get user's active membership
  const { data: membership, error: membershipError } = await supabase
    .from('user_memberships')
    .select('id')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();

  if (membershipError || !membership) {
    throw new Error('User does not have an active membership');
  }

  const VOUCHER_EXPIRATION_MONTHS = 12;
  await allocateVouchers(membership.id, count, VOUCHER_EXPIRATION_MONTHS);
  
  // Log admin action
  await supabase.from('admin_actions').insert({
    admin_id: adminId,
    action_type: 'allocate_vouchers',
    target_user_id: userId,
    details: { count, reason },
    created_at: new Date().toISOString(),
  });
}

/**
 * Cancel user membership
 */
export async function cancelUserMembership(
  userId: string,
  reason: string,
  adminId: string
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('user_memberships')
    .update({
      status: 'cancelled',
      cancellation_reason: reason,
      cancelled_at: new Date().toISOString(),
      cancelled_by: adminId,
    })
    .eq('user_id', userId)
    .eq('status', 'active');

  if (error) {
    throw new Error(`Failed to cancel membership: ${error.message}`);
  }

  // Log admin action
  await supabase.from('admin_actions').insert({
    admin_id: adminId,
    action_type: 'cancel_membership',
    target_user_id: userId,
    details: { reason },
    created_at: new Date().toISOString(),
  });
}

/**
 * Refund ticket
 */
export async function refundTicket(
  ticketId: string,
  reason: string,
  adminId: string
): Promise<void> {
  const supabase = await createClient();

  // Get ticket details
  const { data: ticket, error: ticketError } = await supabase
    .from('tickets')
    .select('user_id, order_id, price')
    .eq('id', ticketId)
    .single();

  if (ticketError || !ticket) {
    throw new Error('Ticket not found');
  }

  // Mark ticket as cancelled
  const { error: updateError } = await supabase
    .from('tickets')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      cancellation_reason: reason,
    })
    .eq('id', ticketId);

  if (updateError) {
    throw new Error(`Failed to cancel ticket: ${updateError.message}`);
  }

  // Update order refund amount
  await supabase
    .from('orders')
    .update({
      refunded_amount: ticket.price,
      refund_reason: reason,
      refunded_at: new Date().toISOString(),
    })
    .eq('id', ticket.order_id);

  // Log admin action
  await supabase.from('admin_actions').insert({
    admin_id: adminId,
    action_type: 'refund_ticket',
    target_user_id: ticket.user_id,
    details: { ticketId, reason, amount: ticket.price },
    created_at: new Date().toISOString(),
  });

  // Process actual refund through Stripe
  const { data: order } = await supabase
    .from('orders')
    .select('stripe_payment_intent_id, total_amount')
    .eq('id', ticket.order_id)
    .single();

  if (order?.stripe_payment_intent_id) {
    try {
      const { stripe } = await import('@/lib/stripe/server');
      
      // Create refund in Stripe
      await stripe.refunds.create({
        payment_intent: order.stripe_payment_intent_id,
        amount: Math.round(parseFloat(ticket.price) * 100), // Convert to cents
        reason: 'requested_by_customer',
        metadata: {
          ticket_id: ticketId,
          admin_id: adminId,
          reason: reason || 'Admin refund',
        },
      });
    } catch (stripeError) {
      console.error('Stripe refund failed:', stripeError);
      throw new Error('Failed to process Stripe refund');
    }
  }
}

/**
 * Get admin action log
 */
export async function getAdminActionLog(
  filters?: {
    adminId?: string;
    actionType?: string;
    startDate?: string;
    endDate?: string;
  },
  limit: number = 100
): Promise<any[]> {
  const supabase = await createClient();

  let query = supabase
    .from('admin_actions')
    .select(`
      *,
      profiles!admin_id (display_name, email),
      profiles!target_user_id (display_name, email)
    `)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (filters?.adminId) {
    query = query.eq('admin_id', filters.adminId);
  }

  if (filters?.actionType) {
    query = query.eq('action_type', filters.actionType);
  }

  if (filters?.startDate) {
    query = query.gte('created_at', filters.startDate);
  }

  if (filters?.endDate) {
    query = query.lte('created_at', filters.endDate);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to get admin log: ${error.message}`);
  }

  return data || [];
}

/**
 * List all members with filters
 */
export async function listMembers(filters?: {
  tier?: string;
  status?: string;
  search?: string;
}): Promise<any[]> {
  const supabase = await createClient();

  let query = supabase
    .from('user_memberships')
    .select(`
      *,
      profiles (email, display_name),
      membership_tiers (tier_name, tier_level)
    `)
    .order('created_at', { ascending: false });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.tier) {
    query = query.eq('membership_tiers.tier_name', filters.tier);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to list members: ${error.message}`);
  }

  // Apply search filter if provided
  if (filters?.search) {
    const searchLower = filters.search.toLowerCase();
    return data?.filter(member => {
      const profileData = Array.isArray(member.profiles) ? member.profiles[0] : member.profiles;
      const email = profileData?.email?.toLowerCase() || '';
      const name = profileData?.display_name?.toLowerCase() || '';
      return email.includes(searchLower) || name.includes(searchLower);
    }) || [];
  }

  return data || [];
}

/**
 * Export user data (GDPR compliance)
 */
export async function exportUserData(userId: string): Promise<any> {
  const supabase = await createClient();

  const [profile, memberships, tickets, orders] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).single(),
    supabase.from('user_memberships').select('*').eq('user_id', userId),
    supabase.from('tickets').select('*').eq('user_id', userId),
    supabase.from('orders').select('*').eq('user_id', userId),
  ]);

  return {
    profile: profile.data,
    memberships: memberships.data,
    tickets: tickets.data,
    orders: orders.data,
    exported_at: new Date().toISOString(),
  };
}
