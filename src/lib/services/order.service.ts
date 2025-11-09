/* eslint-disable no-magic-numbers */
// Pagination limits
import { createClient } from '@/lib/supabase/server';
import { Database } from '@/types/database';
import { ErrorResponses } from '@/lib/api/error-handler';

type Order = Database['public']['Tables']['orders']['Row'];
type OrderInsert = Database['public']['Tables']['orders']['Insert'];
type Ticket = Database['public']['Tables']['tickets']['Row'];

export class OrderService {
  private supabase: Awaited<ReturnType<typeof createClient>>;

  constructor(supabase: Awaited<ReturnType<typeof createClient>>) {
    this.supabase = supabase;
  }

  async createOrder(data: OrderInsert): Promise<Order> {
    const { data: order, error } = await this.supabase
      .from('orders')
      .insert(data)
      .select()
      .single();

    if (error) {
      throw ErrorResponses.databaseError('Failed to create order', error);
    }

    return order;
  }

  async getOrderById(id: string, userId: string): Promise<Order> {
    const { data: order, error } = await this.supabase
      .from('orders')
      .select(`
        *,
        events (
          id,
          name,
          start_date,
          venue_name,
          hero_image_url
        ),
        tickets (
          id,
          qr_code,
          status,
          attendee_name,
          ticket_types (
            name,
            price
          )
        )
      `)
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) {
      throw ErrorResponses.notFound('Order not found');
    }

    return order;
  }

  async listUserOrders(userId: string, filters?: {
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ orders: Order[]; total: number }> {
    let query = this.supabase
      .from('orders')
      .select(`
        *,
        events (
          id,
          name,
          start_date,
          venue_name,
          hero_image_url
        )
      `, { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
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

    const { data: orders, error, count } = await query;

    if (error) {
      throw ErrorResponses.databaseError('Failed to fetch orders', error);
    }

    return { orders: orders || [], total: count || 0 };
  }

  async updateOrderStatus(orderId: string, status: string): Promise<Order> {
    const { data: order, error } = await this.supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      throw ErrorResponses.databaseError('Failed to update order status', error);
    }

    return order;
  }

  async completeOrder(orderId: string, paymentIntentId: string): Promise<Order> {
    // Update order status
    const { data: order, error: orderError } = await this.supabase
      .from('orders')
      .update({
        status: 'completed',
        stripe_payment_intent_id: paymentIntentId,
      })
      .eq('id', orderId)
      .select()
      .single();

    if (orderError) {
      throw ErrorResponses.databaseError('Failed to complete order', orderError);
    }

    // Activate all tickets for this order
    const { error: ticketError } = await this.supabase
      .from('tickets')
      .update({ status: 'active' })
      .eq('order_id', orderId);

    if (ticketError) {
      throw ErrorResponses.databaseError('Failed to activate tickets', ticketError);
    }

    return order;
  }

  async cancelOrder(orderId: string, userId: string): Promise<Order> {
    // Get order details
    const { data: order, error: fetchError } = await this.supabase
      .from('orders')
      .select('*, tickets(*)')
      .eq('id', orderId)
      .eq('user_id', userId)
      .single();

    if (fetchError) {
      throw ErrorResponses.notFound('Order not found');
    }

    if (order.status === 'cancelled' || order.status === 'refunded') {
      throw ErrorResponses.conflict('Order already cancelled or refunded');
    }

    // Update order status
    const { data: updatedOrder, error: updateError } = await this.supabase
      .from('orders')
      .update({ status: 'cancelled' })
      .eq('id', orderId)
      .select()
      .single();

    if (updateError) {
      throw ErrorResponses.databaseError('Failed to cancel order', updateError);
    }

    // Cancel all tickets
    const { error: ticketError } = await this.supabase
      .from('tickets')
      .update({ status: 'cancelled' })
      .eq('order_id', orderId);

    if (ticketError) {
      throw ErrorResponses.databaseError('Failed to cancel tickets', ticketError);
    }

    return updatedOrder;
  }

  async getOrderTickets(orderId: string, userId: string): Promise<Ticket[]> {
    const { data: tickets, error } = await this.supabase
      .from('tickets')
      .select(`
        *,
        ticket_types (
          name,
          price
        ),
        orders!inner (
          user_id
        )
      `)
      .eq('order_id', orderId)
      .eq('orders.user_id', userId);

    if (error) {
      throw ErrorResponses.databaseError('Failed to fetch tickets', error);
    }

    return tickets || [];
  }

  async validateTicketInventory(ticketTypeId: string, quantity: number): Promise<boolean> {
    const { data: ticketType, error } = await this.supabase
      .from('ticket_types')
      .select('quantity_available, quantity_sold')
      .eq('id', ticketTypeId)
      .single();

    if (error) {
      throw ErrorResponses.notFound('Ticket type not found');
    }

    const available = ticketType.quantity_available - ticketType.quantity_sold;
    
    if (available < quantity) {
      throw ErrorResponses.insufficientInventory(available);
    }

    return true;
  }

  async incrementTicketsSold(ticketTypeId: string, quantity: number): Promise<void> {
    const { error } = await this.supabase.rpc('increment_tickets_sold', {
      p_ticket_type_id: ticketTypeId,
      p_quantity: quantity,
    });

    if (error) {
      throw ErrorResponses.databaseError('Failed to update ticket inventory', error);
    }
  }

  async decrementTicketsSold(ticketTypeId: string, quantity: number): Promise<void> {
    const { error } = await this.supabase.rpc('decrement_tickets_sold', {
      p_ticket_type_id: ticketTypeId,
      p_quantity: quantity,
    });

    if (error) {
      throw ErrorResponses.databaseError('Failed to update ticket inventory', error);
    }
  }
}
