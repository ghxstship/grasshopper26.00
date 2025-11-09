/* eslint-disable no-magic-numbers */
// Notification pagination and batch sizes
import { createClient } from '@/lib/supabase/server';
import { Database } from '@/types/database';
import { sendOrderConfirmationEmail, sendEventReminderEmail } from '@/lib/email/send';
import { ErrorResponses } from '@/lib/api/error-handler';

type Notification = Database['public']['Tables']['notifications']['Row'];
type NotificationInsert = Database['public']['Tables']['notifications']['Insert'];

export class NotificationService {
  private supabase: Awaited<ReturnType<typeof createClient>>;

  constructor(supabase: Awaited<ReturnType<typeof createClient>>) {
    this.supabase = supabase;
  }

  async createNotification(data: NotificationInsert): Promise<Notification> {
    const { data: notification, error } = await this.supabase
      .from('notifications')
      .insert(data)
      .select()
      .single();

    if (error) {
      throw ErrorResponses.databaseError('Failed to create notification', error);
    }

    return notification;
  }

  async getUserNotifications(userId: string, filters?: {
    unreadOnly?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{ notifications: Notification[]; total: number }> {
    let query = this.supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (filters?.unreadOnly) {
      query = query.eq('read', false);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.range(
        filters.offset,
        filters.offset + (filters.limit || 20) - 1
      );
    }

    const { data: notifications, error, count } = await query;

    if (error) {
      throw ErrorResponses.databaseError('Failed to fetch notifications', error);
    }

    return { notifications: notifications || [], total: count || 0 };
  }

  async markAsRead(notificationId: string, userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)
      .eq('user_id', userId);

    if (error) {
      throw ErrorResponses.databaseError('Failed to mark notification as read', error);
    }
  }

  async markAllAsRead(userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) {
      throw ErrorResponses.databaseError('Failed to mark all notifications as read', error);
    }
  }

  async deleteNotification(notificationId: string, userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)
      .eq('user_id', userId);

    if (error) {
      throw ErrorResponses.databaseError('Failed to delete notification', error);
    }
  }

  async sendOrderConfirmation(orderId: string): Promise<void> {
    // Get order details
    const { data: order, error: orderError } = await this.supabase
      .from('orders')
      .select(`
        *,
        events (
          name
        ),
        tickets (
          id
        )
      `)
      .eq('id', orderId)
      .single();

    if (orderError) {
      throw ErrorResponses.notFound('Order not found');
    }

    // Get user details
    const { data: userData } = await this.supabase.auth.admin.getUserById(order.user_id);

    if (!userData?.user?.email) {
      throw ErrorResponses.notFound('User email not found');
    }

    // Send email
    await sendOrderConfirmationEmail({
      to: userData.user.email,
      customerName: userData.user.user_metadata?.name || 'Customer',
      orderNumber: order.id.slice(0, 8).toUpperCase(),
      eventName: order.events?.name || 'Event',
      ticketCount: order.tickets?.length || 0,
      totalAmount: parseFloat(order.total_amount),
    });

    // Create notification
    await this.createNotification({
      user_id: order.user_id,
      type: 'order_confirmation',
      title: 'Order Confirmed',
      message: `Your order for ${order.events?.name} has been confirmed!`,
      metadata: { orderId: order.id },
    });
  }

  async sendEventReminder(eventId: string): Promise<void> {
    // Get event details
    const { data: event, error: eventError } = await this.supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (eventError) {
      throw ErrorResponses.notFound('Event not found');
    }

    // Get all users with tickets for this event
    const { data: orders, error: ordersError } = await this.supabase
      .from('orders')
      .select('user_id')
      .eq('event_id', eventId)
      .eq('status', 'completed');

    if (ordersError) {
      throw ErrorResponses.databaseError('Failed to fetch orders', ordersError);
    }

    const uniqueUserIds = [...new Set(orders.map(o => o.user_id))];

    // Send reminders to all users
    for (const userId of uniqueUserIds) {
      const { data: userData } = await this.supabase.auth.admin.getUserById(userId);

      if (userData?.user?.email) {
        try {
          await sendEventReminderEmail({
            to: userData.user.email,
            customerName: userData.user.user_metadata?.name || 'Customer',
            eventName: event.name,
            eventDate: new Date(event.start_date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }),
            venueName: event.venue_name || 'TBA',
          });

          // Create notification
          await this.createNotification({
            user_id: userId,
            type: 'event_reminder',
            title: 'Event Reminder',
            message: `${event.name} is coming up soon!`,
            metadata: { eventId: event.id },
          });
        } catch (error) {
          console.error(`Failed to send reminder to user ${userId}:`, error);
        }
      }
    }
  }

  async notifyWaitlistAvailability(eventId: string, ticketTypeId: string): Promise<void> {
    // Get waitlist entries
    const { data: waitlistEntries, error } = await this.supabase
      .from('event_waitlist')
      .select('*')
      .eq('event_id', eventId)
      .eq('status', 'waiting')
      .order('created_at', { ascending: true })
      .limit(10);

    if (error) {
      throw ErrorResponses.databaseError('Failed to fetch waitlist', error);
    }

    // Notify users
    for (const entry of waitlistEntries || []) {
      await this.createNotification({
        user_id: entry.user_id,
        type: 'waitlist_available',
        title: 'Tickets Available!',
        message: 'Tickets are now available for an event on your waitlist.',
        metadata: { eventId, ticketTypeId },
      });

      // Update waitlist status
      await this.supabase
        .from('event_waitlist')
        .update({ status: 'notified' })
        .eq('id', entry.id);
    }
  }

  async getUserPreferences(userId: string): Promise<any> {
    const { data, error } = await this.supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw ErrorResponses.databaseError('Failed to fetch preferences', error);
    }

    return data || {
      email_enabled: true,
      push_enabled: true,
      sms_enabled: false,
      in_app_enabled: true,
    };
  }

  async updateUserPreferences(userId: string, preferences: any): Promise<void> {
    const { error } = await this.supabase
      .from('notification_preferences')
      .upsert({
        user_id: userId,
        ...preferences,
      });

    if (error) {
      throw ErrorResponses.databaseError('Failed to update preferences', error);
    }
  }
}
