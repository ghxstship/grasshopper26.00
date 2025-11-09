/**
 * Event Waitlist System
 * Manages waitlists for sold-out events with tier-based priority and automation
 */

import { createClient } from '@/lib/supabase/server';
import { sendWaitlistNotificationEmail } from '@/lib/email/send';
import { ErrorResponses } from '@/lib/api/error-handler';

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
 * Notify next users in waitlist when tickets become available (enhanced)
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
      events (title, start_date),
      ticket_types (name, price)
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
  const errors: string[] = [];

  for (const entry of waitlistEntries) {
    try {
      // Mark as notified
      const { error: updateError } = await supabase
        .from('event_waitlist')
        .update({
          status: 'notified',
          notified_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
        })
        .eq('id', entry.id);

      if (updateError) {
        errors.push(`Failed to update entry ${entry.id}: ${updateError.message}`);
        continue;
      }

      // Send notification email
      const profileData = Array.isArray(entry.profiles) ? entry.profiles[0] : entry.profiles;
      const eventData = Array.isArray(entry.events) ? entry.events[0] : entry.events;
      const ticketTypeData = Array.isArray(entry.ticket_types) ? entry.ticket_types[0] : entry.ticket_types;

      if (profileData?.email && eventData && ticketTypeData) {
        try {
          await sendWaitlistNotificationEmail({
            to: profileData.email,
            customerName: profileData.display_name || 'Member',
            eventName: eventData.title,
            ticketTypeName: ticketTypeData.name,
            expiresAt: expiresAt.toLocaleString(),
          });

          notifiedCount++;

          // Create notification record
          await supabase.from('notifications').insert({
            user_id: entry.user_id,
            type: 'waitlist_available',
            channel: 'email',
            title: 'Tickets Available!',
            message: `Tickets are now available for ${eventData.title}`,
            metadata: {
              eventId,
              ticketTypeId,
              expiresAt: expiresAt.toISOString(),
            },
          });
        } catch (emailError: any) {
          errors.push(`Failed to send email to ${profileData.email}: ${emailError.message}`);
        }
      } else {
        errors.push(`Missing data for entry ${entry.id}`);
      }
    } catch (error: any) {
      errors.push(`Failed to process entry ${entry.id}: ${error.message}`);
    }
  }

  if (errors.length > 0) {
    console.error('Waitlist notification errors:', errors);
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

/**
 * Automated waitlist processing when tickets become available
 */
export async function processWaitlistAutomatically(
  eventId: string,
  ticketTypeId: string,
  availableQuantity: number
): Promise<{
  notified: number;
  errors: string[];
}> {
  const supabase = await createClient();
  const errors: string[] = [];

  try {
    // Get waitlist entries in priority order
    const { data: waitlistEntries, error: fetchError } = await supabase
      .from('event_waitlist')
      .select(`
        *,
        profiles (email, display_name),
        events (title),
        ticket_types (name, price)
      `)
      .eq('event_id', eventId)
      .eq('ticket_type_id', ticketTypeId)
      .eq('status', 'waiting')
      .order('priority_score', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(availableQuantity);

    if (fetchError) {
      throw new Error(`Failed to fetch waitlist: ${fetchError.message}`);
    }

    if (!waitlistEntries || waitlistEntries.length === 0) {
      return { notified: 0, errors: [] };
    }

    const notified = await notifyWaitlist(eventId, ticketTypeId, availableQuantity);

    return {
      notified,
      errors,
    };
  } catch (error: any) {
    errors.push(error.message);
    return { notified: 0, errors };
  }
}

/**
 * Batch add users to waitlist
 */
export async function batchJoinWaitlist(
  requests: Array<{
    eventId: string;
    userId: string;
    ticketTypeId: string;
  }>
): Promise<{
  successful: number;
  failed: number;
  results: Array<{
    userId: string;
    success: boolean;
    position?: number;
    error?: string;
  }>;
}> {
  let successful = 0;
  let failed = 0;
  const results: Array<{
    userId: string;
    success: boolean;
    position?: number;
    error?: string;
  }> = [];

  for (const request of requests) {
    try {
      const { position } = await joinWaitlist(
        request.eventId,
        request.userId,
        request.ticketTypeId
      );

      successful++;
      results.push({
        userId: request.userId,
        success: true,
        position,
      });
    } catch (error: any) {
      failed++;
      results.push({
        userId: request.userId,
        success: false,
        error: error.message,
      });
    }
  }

  return { successful, failed, results };
}

/**
 * Get waitlist conversion rate
 */
export async function getWaitlistConversionRate(
  eventId: string
): Promise<{
  totalNotified: number;
  totalPurchased: number;
  conversionRate: number;
  averageTimeToConvert: number; // in hours
}> {
  const supabase = await createClient();

  const { data: entries, error } = await supabase
    .from('event_waitlist')
    .select('status, notified_at, purchased_at')
    .eq('event_id', eventId)
    .in('status', ['notified', 'purchased']);

  if (error) {
    throw new Error(`Failed to get conversion data: ${error.message}`);
  }

  const notified = entries?.filter(e => e.status === 'notified' || e.status === 'purchased') || [];
  const purchased = entries?.filter(e => e.status === 'purchased') || [];

  const totalNotified = notified.length;
  const totalPurchased = purchased.length;
  const conversionRate = totalNotified > 0 ? (totalPurchased / totalNotified) * 100 : 0;

  // Calculate average time to convert
  let totalConversionTime = 0;
  let conversionCount = 0;

  purchased.forEach(entry => {
    if (entry.notified_at && entry.purchased_at) {
      const notifiedTime = new Date(entry.notified_at).getTime();
      const purchasedTime = new Date(entry.purchased_at).getTime();
      const hours = (purchasedTime - notifiedTime) / (1000 * 60 * 60);
      totalConversionTime += hours;
      conversionCount++;
    }
  });

  const averageTimeToConvert = conversionCount > 0 
    ? totalConversionTime / conversionCount 
    : 0;

  return {
    totalNotified,
    totalPurchased,
    conversionRate: Math.round(conversionRate * 10) / 10,
    averageTimeToConvert: Math.round(averageTimeToConvert * 10) / 10,
  };
}

/**
 * Clean up expired and completed waitlist entries
 */
export async function cleanupWaitlist(
  eventId: string
): Promise<{
  expiredRemoved: number;
  completedRemoved: number;
}> {
  const supabase = await createClient();

  // Remove expired entries older than 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: expiredEntries, error: expiredError } = await supabase
    .from('event_waitlist')
    .select('id')
    .eq('event_id', eventId)
    .eq('status', 'expired')
    .lt('created_at', thirtyDaysAgo.toISOString());

  let expiredRemoved = 0;
  if (!expiredError && expiredEntries && expiredEntries.length > 0) {
    const expiredIds = expiredEntries.map(e => e.id);
    const { error: deleteError } = await supabase
      .from('event_waitlist')
      .delete()
      .in('id', expiredIds);

    if (!deleteError) {
      expiredRemoved = expiredEntries.length;
    }
  }

  // Remove purchased entries older than 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: completedEntries, error: completedError } = await supabase
    .from('event_waitlist')
    .select('id')
    .eq('event_id', eventId)
    .eq('status', 'purchased')
    .lt('purchased_at', sevenDaysAgo.toISOString());

  let completedRemoved = 0;
  if (!completedError && completedEntries && completedEntries.length > 0) {
    const completedIds = completedEntries.map(e => e.id);
    const { error: deleteError } = await supabase
      .from('event_waitlist')
      .delete()
      .in('id', completedIds);

    if (!deleteError) {
      completedRemoved = completedEntries.length;
    }
  }

  return {
    expiredRemoved,
    completedRemoved,
  };
}

/**
 * Get user's waitlist summary across all events
 */
export async function getUserWaitlistSummary(
  userId: string
): Promise<Array<{
  eventId: string;
  eventTitle: string;
  ticketTypeName: string;
  position: number;
  total: number;
  status: string;
  joinedAt: string;
}>> {
  const supabase = await createClient();

  const { data: entries, error } = await supabase
    .from('event_waitlist')
    .select(`
      *,
      events (id, title),
      ticket_types (name)
    `)
    .eq('user_id', userId)
    .in('status', ['waiting', 'notified'])
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to get waitlist summary: ${error.message}`);
  }

  const summary = await Promise.all(
    (entries || []).map(async entry => {
      const eventData = Array.isArray(entry.events) ? entry.events[0] : entry.events;
      const ticketTypeData = Array.isArray(entry.ticket_types) 
        ? entry.ticket_types[0] 
        : entry.ticket_types;

      const positionData = await getWaitlistPosition(
        userId,
        entry.event_id,
        entry.ticket_type_id
      );

      return {
        eventId: entry.event_id,
        eventTitle: eventData?.title || 'Unknown Event',
        ticketTypeName: ticketTypeData?.name || 'Unknown Ticket',
        position: positionData?.position || 0,
        total: positionData?.total || 0,
        status: entry.status,
        joinedAt: entry.created_at,
      };
    })
  );

  return summary;
}

/**
 * Reorder waitlist priorities (admin function)
 */
export async function reorderWaitlistPriorities(
  eventId: string,
  ticketTypeId: string
): Promise<{ updated: number }> {
  const supabase = await createClient();

  // Get all waiting entries
  const { data: entries, error: fetchError } = await supabase
    .from('event_waitlist')
    .select('id, user_id, membership_tier, created_at')
    .eq('event_id', eventId)
    .eq('ticket_type_id', ticketTypeId)
    .eq('status', 'waiting');

  if (fetchError || !entries) {
    throw new Error('Failed to fetch waitlist entries');
  }

  let updated = 0;

  // Recalculate priority scores
  for (const entry of entries) {
    const priorityScore = calculatePriorityScore(
      entry.membership_tier,
      new Date(entry.created_at)
    );

    const { error: updateError } = await supabase
      .from('event_waitlist')
      .update({ priority_score: priorityScore })
      .eq('id', entry.id);

    if (!updateError) {
      updated++;
    }
  }

  return { updated };
}
