/**
 * Inventory Management Service
 * Comprehensive ticket inventory tracking and management
 */

import { createClient } from '@/lib/supabase/server';
import { ErrorResponses } from '@/lib/api/error-handler';

// Define TicketType locally since generated types are incomplete
interface TicketType {
  id: string;
  event_id: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  quantity_sold: number;
  is_active: boolean;
  sale_start_date?: string;
  sale_end_date?: string;
  max_per_order?: number;
  created_at: string;
  updated_at: string;
}

export interface InventoryStatus {
  ticketTypeId: string;
  ticketTypeName: string;
  totalQuantity: number;
  quantitySold: number;
  quantityAvailable: number;
  quantityReserved: number;
  percentageSold: number;
  isSoldOut: boolean;
  lowStockThreshold: number;
  isLowStock: boolean;
}

export interface InventoryAdjustment {
  ticketTypeId: string;
  adjustment: number;
  reason: string;
  adjustedBy: string;
  notes?: string;
}

export interface ReservationRequest {
  ticketTypeId: string;
  quantity: number;
  userId: string;
  expiresInMinutes?: number;
}

export interface InventoryReservation {
  id: string;
  ticketTypeId: string;
  quantity: number;
  userId: string;
  expiresAt: string;
  status: 'active' | 'completed' | 'expired' | 'cancelled';
}

export class InventoryService {
  private supabase: Awaited<ReturnType<typeof createClient>>;
  private readonly LOW_STOCK_THRESHOLD = 0.1; // 10% of total
  private readonly DEFAULT_RESERVATION_MINUTES = 15;

  constructor(supabase: Awaited<ReturnType<typeof createClient>>) {
    this.supabase = supabase;
  }

  /**
   * Get comprehensive inventory status for a ticket type
   */
  async getInventoryStatus(ticketTypeId: string): Promise<InventoryStatus> {
    const { data: ticketType, error } = await this.supabase
      .from('ticket_types')
      .select('id, name, quantity_available, quantity_sold')
      .eq('id', ticketTypeId)
      .single();

    if (error || !ticketType) {
      throw ErrorResponses.notFound('Ticket type not found');
    }

    const totalQuantity = ticketType.quantity_available + ticketType.quantity_sold;
    const quantityAvailable = ticketType.quantity_available;
    const quantitySold = ticketType.quantity_sold;
    
    // Get reserved quantity
    const { data: reservations } = await this.supabase
      .from('inventory_reservations')
      .select('quantity')
      .eq('ticket_type_id', ticketTypeId)
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString());

    const quantityReserved = reservations?.reduce((sum, r) => sum + r.quantity, 0) || 0;
    const percentageSold = totalQuantity > 0 ? (quantitySold / totalQuantity) * 100 : 0;
    const lowStockThreshold = Math.ceil(totalQuantity * this.LOW_STOCK_THRESHOLD);

    return {
      ticketTypeId,
      ticketTypeName: ticketType.name,
      totalQuantity,
      quantitySold,
      quantityAvailable,
      quantityReserved,
      percentageSold: Math.round(percentageSold * 10) / 10,
      isSoldOut: quantityAvailable <= 0,
      lowStockThreshold,
      isLowStock: quantityAvailable <= lowStockThreshold && quantityAvailable > 0,
    };
  }

  /**
   * Get inventory status for all ticket types of an event
   */
  async getEventInventoryStatus(eventId: string): Promise<InventoryStatus[]> {
    const { data: ticketTypes, error } = await this.supabase
      .from('ticket_types')
      .select('id')
      .eq('event_id', eventId);

    if (error) {
      throw ErrorResponses.databaseError('Failed to fetch ticket types', error);
    }

    const statuses = await Promise.all(
      (ticketTypes || []).map(tt => this.getInventoryStatus(tt.id))
    );

    return statuses;
  }

  /**
   * Reserve inventory temporarily (for checkout process)
   */
  async reserveInventory(request: ReservationRequest): Promise<InventoryReservation> {
    const { ticketTypeId, quantity, userId, expiresInMinutes } = request;

    // Check availability
    const status = await this.getInventoryStatus(ticketTypeId);
    const actuallyAvailable = status.quantityAvailable - status.quantityReserved;

    if (actuallyAvailable < quantity) {
      throw ErrorResponses.insufficientInventory(actuallyAvailable);
    }

    // Create reservation
    const expiresAt = new Date();
    expiresAt.setMinutes(
      expiresAt.getMinutes() + (expiresInMinutes || this.DEFAULT_RESERVATION_MINUTES)
    );

    const { data: reservation, error } = await this.supabase
      .from('inventory_reservations')
      .insert({
        ticket_type_id: ticketTypeId,
        quantity,
        user_id: userId,
        expires_at: expiresAt.toISOString(),
        status: 'active',
      })
      .select()
      .single();

    if (error) {
      throw ErrorResponses.databaseError('Failed to reserve inventory', error);
    }

    return {
      id: reservation.id,
      ticketTypeId: reservation.ticket_type_id,
      quantity: reservation.quantity,
      userId: reservation.user_id,
      expiresAt: reservation.expires_at,
      status: reservation.status,
    };
  }

  /**
   * Release inventory reservation
   */
  async releaseReservation(reservationId: string): Promise<void> {
    const { error } = await this.supabase
      .from('inventory_reservations')
      .update({ status: 'cancelled' })
      .eq('id', reservationId)
      .eq('status', 'active');

    if (error) {
      throw ErrorResponses.databaseError('Failed to release reservation', error);
    }
  }

  /**
   * Complete reservation (convert to sale)
   */
  async completeReservation(reservationId: string): Promise<void> {
    const { error } = await this.supabase
      .from('inventory_reservations')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', reservationId)
      .eq('status', 'active');

    if (error) {
      throw ErrorResponses.databaseError('Failed to complete reservation', error);
    }
  }

  /**
   * Expire old reservations (cron job)
   */
  async expireOldReservations(): Promise<number> {
    const now = new Date().toISOString();

    const { data: expired, error: fetchError } = await this.supabase
      .from('inventory_reservations')
      .select('id')
      .eq('status', 'active')
      .lt('expires_at', now);

    if (fetchError || !expired || expired.length === 0) {
      return 0;
    }

    const expiredIds = expired.map(r => r.id);

    const { error: updateError } = await this.supabase
      .from('inventory_reservations')
      .update({ status: 'expired' })
      .in('id', expiredIds);

    if (updateError) {
      throw ErrorResponses.databaseError('Failed to expire reservations', updateError);
    }

    return expired.length;
  }

  /**
   * Adjust inventory manually (admin function)
   */
  async adjustInventory(adjustment: InventoryAdjustment): Promise<void> {
    const { ticketTypeId, adjustment: qty, reason, adjustedBy, notes } = adjustment;

    // Get current inventory
    const { data: ticketType, error: fetchError } = await this.supabase
      .from('ticket_types')
      .select('quantity_available, quantity_sold')
      .eq('id', ticketTypeId)
      .single();

    if (fetchError || !ticketType) {
      throw ErrorResponses.notFound('Ticket type not found');
    }

    const newAvailable = ticketType.quantity_available + qty;

    if (newAvailable < 0) {
      throw ErrorResponses.badRequest('Cannot reduce inventory below zero');
    }

    // Update inventory
    const { error: updateError } = await this.supabase
      .from('ticket_types')
      .update({ quantity_available: newAvailable })
      .eq('id', ticketTypeId);

    if (updateError) {
      throw ErrorResponses.databaseError('Failed to adjust inventory', updateError);
    }

    // Log adjustment
    await this.supabase.from('inventory_adjustments').insert({
      ticket_type_id: ticketTypeId,
      adjustment: qty,
      reason,
      adjusted_by: adjustedBy,
      notes,
      previous_quantity: ticketType.quantity_available,
      new_quantity: newAvailable,
      created_at: new Date().toISOString(),
    });
  }

  /**
   * Get inventory adjustment history
   */
  async getAdjustmentHistory(
    ticketTypeId: string,
    limit: number = 50
  ): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('inventory_adjustments')
      .select(`
        *,
        profiles:adjusted_by (display_name, email)
      `)
      .eq('ticket_type_id', ticketTypeId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw ErrorResponses.databaseError('Failed to fetch adjustment history', error);
    }

    return data || [];
  }

  /**
   * Validate inventory before checkout
   */
  async validateCheckoutInventory(
    items: Array<{ ticketTypeId: string; quantity: number }>
  ): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    for (const item of items) {
      try {
        const status = await this.getInventoryStatus(item.ticketTypeId);
        const actuallyAvailable = status.quantityAvailable - status.quantityReserved;

        if (actuallyAvailable < item.quantity) {
          errors.push(
            `${status.ticketTypeName}: Only ${actuallyAvailable} tickets available (requested ${item.quantity})`
          );
        }
      } catch (error) {
        errors.push(`${item.ticketTypeId}: Failed to check availability`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get low stock alerts
   */
  async getLowStockAlerts(eventId?: string): Promise<InventoryStatus[]> {
    let query = this.supabase
      .from('ticket_types')
      .select('id, event_id');

    if (eventId) {
      query = query.eq('event_id', eventId);
    }

    const { data: ticketTypes, error } = await query;

    if (error) {
      throw ErrorResponses.databaseError('Failed to fetch ticket types', error);
    }

    const statuses = await Promise.all(
      (ticketTypes || []).map(tt => this.getInventoryStatus(tt.id))
    );

    return statuses.filter(s => s.isLowStock);
  }

  /**
   * Bulk inventory update
   */
  async bulkUpdateInventory(
    updates: Array<{ ticketTypeId: string; quantityAvailable: number }>
  ): Promise<{ success: number; failed: number; errors: string[] }> {
    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const update of updates) {
      try {
        const { error } = await this.supabase
          .from('ticket_types')
          .update({ quantity_available: update.quantityAvailable })
          .eq('id', update.ticketTypeId);

        if (error) {
          failed++;
          errors.push(`${update.ticketTypeId}: ${error.message}`);
        } else {
          success++;
        }
      } catch (error: any) {
        failed++;
        errors.push(`${update.ticketTypeId}: ${error.message}`);
      }
    }

    return { success, failed, errors };
  }
}
