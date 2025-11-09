/**
 * Event Waitlist System
 * Manages waitlists for sold-out events with tier-based priority
 */

import { createClient } from '@/lib/supabase/server';
import { sendWaitlistNotificationEmail } from '@/lib/email/send';

export interface WaitlistEntry {
  id: string;
  event_id: string;
  user_id: string;
  ticket_type_id: string;
  membership_tier?: number;
  priority_score: number;
  status: 'waiting' | 'notified' | 'purchased' | 'expired';
  notified_at?: string;
  expires_at?: string;
  created_at: string;
}

/**
 * Calculate priority score based on membership tier and join time
 */
function calculatePriorityScore(
  membershipTier: number | null,
  joinedAt: Date
): number {
  // Base score from membership tier (0-100)
  const TIER_WEIGHTS = {
    0: 0,   // No membership
    1: 20,  // Extra
    2: 40,  // Main
    3: 60,  // First Class
    4: 80,  // Business
  };
  
  const tierScore = TIER_WEIGHTS[membershipTier as keyof typeof TIER_WEIGHTS] || 0;
  
  // Time-based score (earlier = higher, max 100 points)
  const now = Date.now();
  const joinTime = joinedAt.getTime();
  const daysSinceJoin = (now - joinTime) / (1000 * 60 * 60 * 24);
  const MAX_DAYS = 30;
  const timeScore = Math.min(100, (daysSinceJoin / MAX_DAYS) * 100);
  
  // Combined score (tier weighted 70%, time weighted 30%)
  const TIER_WEIGHT = 0.7;
  const TIME_WEIGHT = 0.3;
  return Math.round(tierScore * TIER_WEIGHT + timeScore * TIME_WEIGHT);
}

/**
 * Join event waitlist
 */
export async function joinWaitlist(
  eventId: string,
  userId: string,
  ticketTypeId: string
): Promise<{ position: number; priorityScore: number }> {
  const supabase = await createClient();

  // Check if user is already on waitlist
  const { data: existing } = await supabase
    .from('event_waitlist')
    .select('id')
    .eq('event_id', eventId)
    .eq('user_id', userId)
    .eq('ticket_type_id', ticketTypeId)
    .eq('status', 'waiting')
    .single();

  if (existing) {
    throw new Error('You are already on the waitlist for this ticket type');
  }

  // Get user's membership tier
  const { data: membership } = await supabase
    .from('user_memberships')
    .select('tier_id, membership_tiers(tier_level)')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();

  const tierData = membership?.membership_tiers as any;
  const tierLevel = tierData?.tier_level || 0;

  // Calculate priority score
  const priorityScore = calculatePriorityScore(tierLevel, new Date());

  // Add to waitlist
  const { error: insertError } = await supabase
    .from('event_waitlist')
    .insert({
      event_id: eventId,
      user_id: userId,
      ticket_type_id: ticketTypeId,
      membership_tier: tierLevel,
      priority_score: priorityScore,
      status: 'waiting',
    });

  if (insertError) {
    throw new Error(`Failed to join waitlist: ${insertError.message}`);
  }

  // Get position in queue
  const { data: higherPriority } = await supabase
    .from('event_waitlist')
    .select('id')
    .eq('event_id', eventId)
    .eq('ticket_type_id', ticketTypeId)
    .eq('status', 'waiting')
    .gt('priority_score', priorityScore);

  const position = (higherPriority?.length || 0) + 1;

  return {
    position,
    priorityScore,
  };
}

/**
 * Leave waitlist
 */
export async function leaveWaitlist(
  waitlistId: string,
  userId: string
): Promise<void> {
  const supabase = await createClient();

  // Verify ownership
  const { data: entry, error: fetchError } = await supabase
    .from('event_waitlist')
    .select('user_id')
    .eq('id', waitlistId)
    .single();

  if (fetchError || !entry) {
    throw new Error('Waitlist entry not found');
  }

  if (entry.user_id !== userId) {
    throw new Error('You can only remove your own waitlist entries');
  }

  // Remove from waitlist
  const { error: deleteError } = await supabase
    .from('event_waitlist')
    .delete()
    .eq('id', waitlistId);

  if (deleteError) {
    throw new Error(`Failed to leave waitlist: ${deleteError.message}`);
  }
}

/**
 * Notify next users in waitlist when tickets become available
 */
export async function notifyWaitlist(
  eventId: string,
  ticketTypeId: string,
  availableCount: number
): Promise<number> {
  const supabase = await createClient();

  // Get top priority users who haven't been notified
  const { data: waitlistEntries, error: fetchError } = await supabase
    .from('event_waitlist')
    .select(`
      *,
      profiles (email, display_name),
      events (title),
      ticket_types (name)
    `)
    .eq('event_id', eventId)
    .eq('ticket_type_id', ticketTypeId)
    .eq('status', 'waiting')
    .order('priority_score', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(availableCount);

  if (fetchError || !waitlistEntries || waitlistEntries.length === 0) {
    return 0;
  }

  const NOTIFICATION_EXPIRY_HOURS = 24;
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + NOTIFICATION_EXPIRY_HOURS);

  let notifiedCount = 0;

  for (const entry of waitlistEntries) {
    try {
      // Mark as notified
      await supabase
        .from('event_waitlist')
        .update({
          status: 'notified',
          notified_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
        })
        .eq('id', entry.id);

      // Send notification email
      const profileData = Array.isArray(entry.profiles) ? entry.profiles[0] : entry.profiles;
      const eventData = Array.isArray(entry.events) ? entry.events[0] : entry.events;
      const ticketTypeData = Array.isArray(entry.ticket_types) ? entry.ticket_types[0] : entry.ticket_types;

      if (profileData?.email && eventData && ticketTypeData) {
        await sendWaitlistNotificationEmail({
          to: profileData.email,
          customerName: profileData.display_name || 'Member',
          eventName: eventData.title,
          ticketTypeName: ticketTypeData.name,
          expiresAt: expiresAt.toLocaleString(),
        });

        notifiedCount++;
      }
    } catch (error) {
      console.error(`Failed to notify waitlist entry ${entry.id}:`, error);
    }
  }

  return notifiedCount;
}

/**
 * Mark waitlist entry as purchased
 */
export async function markWaitlistPurchased(
  userId: string,
  eventId: string,
  ticketTypeId: string
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('event_waitlist')
    .update({
      status: 'purchased',
      purchased_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('event_id', eventId)
    .eq('ticket_type_id', ticketTypeId)
    .eq('status', 'notified');

  if (error) {
    throw new Error(`Failed to mark as purchased: ${error.message}`);
  }
}

/**
 * Expire old waitlist notifications (cron job)
 */
export async function expireWaitlistNotifications(): Promise<number> {
  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data: expired, error: fetchError } = await supabase
    .from('event_waitlist')
    .select('id')
    .eq('status', 'notified')
    .lt('expires_at', now);

  if (fetchError || !expired || expired.length === 0) {
    return 0;
  }

  const expiredIds = expired.map(e => e.id);

  const { error: updateError } = await supabase
    .from('event_waitlist')
    .update({ status: 'expired' })
    .in('id', expiredIds);

  if (updateError) {
    throw new Error(`Failed to expire notifications: ${updateError.message}`);
  }

  return expired.length;
}

/**
 * Get user's waitlist position
 */
export async function getWaitlistPosition(
  userId: string,
  eventId: string,
  ticketTypeId: string
): Promise<{ position: number; total: number } | null> {
  const supabase = await createClient();

  // Get user's entry
  const { data: userEntry, error: userError } = await supabase
    .from('event_waitlist')
    .select('priority_score')
    .eq('user_id', userId)
    .eq('event_id', eventId)
    .eq('ticket_type_id', ticketTypeId)
    .eq('status', 'waiting')
    .single();

  if (userError || !userEntry) {
    return null;
  }

  // Count higher priority entries
  const { data: higherPriority } = await supabase
    .from('event_waitlist')
    .select('id')
    .eq('event_id', eventId)
    .eq('ticket_type_id', ticketTypeId)
    .eq('status', 'waiting')
    .gt('priority_score', userEntry.priority_score);

  // Count total waiting
  const { data: allWaiting } = await supabase
    .from('event_waitlist')
    .select('id')
    .eq('event_id', eventId)
    .eq('ticket_type_id', ticketTypeId)
    .eq('status', 'waiting');

  return {
    position: (higherPriority?.length || 0) + 1,
    total: allWaiting?.length || 0,
  };
}

/**
 * Get waitlist statistics for an event
 */
export async function getWaitlistStats(eventId: string): Promise<{
  total: number;
  waiting: number;
  notified: number;
  purchased: number;
  expired: number;
  byTier: Record<number, number>;
}> {
  const supabase = await createClient();

  const { data: entries, error } = await supabase
    .from('event_waitlist')
    .select('status, membership_tier')
    .eq('event_id', eventId);

  if (error) {
    throw new Error(`Failed to get waitlist stats: ${error.message}`);
  }

  const stats = {
    total: entries?.length || 0,
    waiting: 0,
    notified: 0,
    purchased: 0,
    expired: 0,
    byTier: {} as Record<number, number>,
  };

  entries?.forEach(entry => {
    if (entry.status === 'waiting') stats.waiting++;
    else if (entry.status === 'notified') stats.notified++;
    else if (entry.status === 'purchased') stats.purchased++;
    else if (entry.status === 'expired') stats.expired++;

    const tier = entry.membership_tier || 0;
    stats.byTier[tier] = (stats.byTier[tier] || 0) + 1;
  });

  return stats;
}
