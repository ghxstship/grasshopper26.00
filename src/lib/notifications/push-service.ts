/**
 * Push Notification Service
 * Handles web push notifications using Web Push API
 */

import { createClient } from '@/lib/supabase/server';
/* eslint-disable no-magic-numbers */
// HTTP status codes for push notification responses
import webpush from 'web-push';

// Configure VAPID details
if (process.env.VAPID_PRIVATE_KEY && process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
  webpush.setVapidDetails(
    'mailto:support@grasshopper.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  data?: Record<string, any>;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  tag?: string;
  requireInteraction?: boolean;
}

/**
 * Subscribe a user to push notifications
 */
export async function subscribeToPushNotifications(
  userId: string,
  subscription: {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  },
  userAgent?: string
) {
  const supabase = await createClient();

  const { error } = await supabase.from('push_subscriptions').upsert({
    user_id: userId,
    endpoint: subscription.endpoint,
    keys: subscription.keys,
    user_agent: userAgent,
  });

  if (error) {
    throw new Error(`Failed to subscribe: ${error.message}`);
  }

  return { success: true };
}

/**
 * Unsubscribe a user from push notifications
 */
export async function unsubscribeFromPushNotifications(
  userId: string,
  endpoint: string
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('push_subscriptions')
    .delete()
    .eq('user_id', userId)
    .eq('endpoint', endpoint);

  if (error) {
    throw new Error(`Failed to unsubscribe: ${error.message}`);
  }

  return { success: true };
}

/**
 * Send push notification to a specific user
 */
export async function sendPushNotificationToUser(
  userId: string,
  notification: PushNotificationPayload
) {
  const supabase = await createClient();

  // Get all subscriptions for the user
  const { data: subscriptions, error } = await supabase
    .from('push_subscriptions')
    .select('*')
    .eq('user_id', userId);

  if (error || !subscriptions || subscriptions.length === 0) {
    console.warn(`No push subscriptions found for user ${userId}`);
    return { success: false, sent: 0 };
  }

  const payload = JSON.stringify(notification);
  const results = await Promise.allSettled(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: sub.keys as any,
          },
          payload
        );
        return { success: true, endpoint: sub.endpoint };
      } catch (error: any) {
        console.error(`Failed to send to ${sub.endpoint}:`, error);
        
        // Remove invalid subscriptions (410 Gone or 404 Not Found)
        if (error.statusCode === 410 || error.statusCode === 404) {
          await supabase
            .from('push_subscriptions')
            .delete()
            .eq('endpoint', sub.endpoint);
        }
        
        return { success: false, endpoint: sub.endpoint, error };
      }
    })
  );

  const successful = results.filter((r) => r.status === 'fulfilled').length;

  return { success: successful > 0, sent: successful, total: subscriptions.length };
}

/**
 * Send push notification to multiple users
 */
export async function sendPushNotificationToUsers(
  userIds: string[],
  notification: PushNotificationPayload
) {
  const results = await Promise.allSettled(
    userIds.map((userId) => sendPushNotificationToUser(userId, notification))
  );

  const totalSent = results
    .filter((r) => r.status === 'fulfilled')
    .reduce((sum, r: any) => sum + (r.value?.sent || 0), 0);

  return { success: totalSent > 0, sent: totalSent };
}

/**
 * Send notification to all users attending an event
 */
export async function sendEventNotification(
  eventId: string,
  notification: PushNotificationPayload
) {
  const supabase = await createClient();

  // Get all completed orders for this event
  const { data: orders } = await supabase
    .from('orders')
    .select('id')
    .eq('event_id', eventId)
    .eq('status', 'completed');

  if (!orders || orders.length === 0) {
    return { success: false, sent: 0 };
  }

  const orderIds = orders.map(o => o.id);

  // Get all users with tickets for this event
  const { data: tickets } = await supabase
    .from('tickets')
    .select('user_id')
    .eq('status', 'active')
    .in('order_id', orderIds);

  if (!tickets || tickets.length === 0) {
    return { success: false, sent: 0 };
  }

  const uniqueUserIds = [...new Set(tickets.map((t) => t.user_id))];
  
  return await sendPushNotificationToUsers(uniqueUserIds, notification);
}

/**
 * Send notification about ticket sales starting
 */
export async function sendTicketOnSaleNotification(eventId: string, eventName: string) {
  return await sendEventNotification(eventId, {
    title: '🎟️ Tickets On Sale!',
    body: `Tickets for ${eventName} are now available!`,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: `ticket-sale-${eventId}`,
    data: {
      type: 'ticket_sale',
      eventId,
      url: `/events/${eventId}`,
    },
    actions: [
      {
        action: 'view',
        title: 'View Event',
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
      },
    ],
  });
}

/**
 * Send event reminder notification
 */
export async function sendEventReminderNotification(
  eventId: string,
  eventName: string,
  startTime: string
) {
  return await sendEventNotification(eventId, {
    title: '⏰ Event Reminder',
    body: `${eventName} starts soon! Get ready!`,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: `event-reminder-${eventId}`,
    requireInteraction: true,
    data: {
      type: 'event_reminder',
      eventId,
      startTime,
      url: `/events/${eventId}`,
    },
    actions: [
      {
        action: 'view',
        title: 'View Details',
      },
      {
        action: 'directions',
        title: 'Get Directions',
      },
    ],
  });
}

/**
 * Send lineup announcement notification
 */
export async function sendLineupAnnouncementNotification(
  eventId: string,
  eventName: string,
  artistName: string
) {
  return await sendEventNotification(eventId, {
    title: '🎤 Lineup Update!',
    body: `${artistName} has been added to ${eventName}!`,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: `lineup-${eventId}`,
    data: {
      type: 'lineup_announcement',
      eventId,
      artistName,
      url: `/events/${eventId}`,
    },
    actions: [
      {
        action: 'view',
        title: 'View Lineup',
      },
    ],
  });
}

/**
 * Send emergency alert to event attendees
 */
export async function sendEmergencyAlert(
  eventId: string,
  alertTitle: string,
  alertMessage: string
) {
  return await sendEventNotification(eventId, {
    title: `🚨 ${alertTitle}`,
    body: alertMessage,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: `emergency-${eventId}-${Date.now()}`,
    requireInteraction: true,
    data: {
      type: 'emergency_alert',
      eventId,
      timestamp: new Date().toISOString(),
    },
  });
}
