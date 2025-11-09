/* eslint-disable no-magic-numbers */
// Pagination and query limits
import { createClient } from '@/lib/supabase/server';
import { Database } from '@/types/database';
import { ErrorResponses } from '@/lib/api/error-handler';

type Event = Database['public']['Tables']['events']['Row'];
type EventInsert = Database['public']['Tables']['events']['Insert'];
type EventUpdate = Database['public']['Tables']['events']['Update'];

export class EventService {
  private supabase: Awaited<ReturnType<typeof createClient>>;

  constructor(supabase: Awaited<ReturnType<typeof createClient>>) {
    this.supabase = supabase;
  }

  async createEvent(data: EventInsert): Promise<Event> {
    const { data: event, error } = await this.supabase
      .from('events')
      .insert(data)
      .select()
      .single();

    if (error) {
      throw ErrorResponses.databaseError('Failed to create event', error);
    }

    return event;
  }

  async getEventById(id: string): Promise<Event> {
    const { data: event, error } = await this.supabase
      .from('events')
      .select(`
        *,
        event_artists (
          artist_id,
          artists (
            id,
            name,
            profile_image_url,
            genre_tags
          )
        ),
        ticket_types (
          id,
          name,
          description,
          price,
          quantity_available,
          quantity_sold,
          max_per_order
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      throw ErrorResponses.notFound('Event not found');
    }

    return event;
  }

  async listEvents(filters: {
    brandId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ events: Event[]; total: number }> {
    let query = this.supabase
      .from('events')
      .select(`
        *,
        event_artists (
          artist_id,
          artists (name, profile_image_url)
        ),
        ticket_types (
          id,
          name,
          price,
          quantity_available,
          quantity_sold
        )
      `, { count: 'exact' })
      .order('start_date', { ascending: false });

    if (filters.brandId) {
      query = query.eq('brand_id', filters.brandId);
    }

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.startDate) {
      query = query.gte('start_date', filters.startDate);
    }

    if (filters.endDate) {
      query = query.lte('start_date', filters.endDate);
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1);
    }

    const { data: events, error, count } = await query;

    if (error) {
      throw ErrorResponses.databaseError('Failed to fetch events', error);
    }

    return { events: events || [], total: count || 0 };
  }

  async updateEvent(id: string, data: EventUpdate): Promise<Event> {
    const { data: event, error } = await this.supabase
      .from('events')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw ErrorResponses.databaseError('Failed to update event', error);
    }

    return event;
  }

  async deleteEvent(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('events')
      .delete()
      .eq('id', id);

    if (error) {
      throw ErrorResponses.databaseError('Failed to delete event', error);
    }
  }

  async publishEvent(id: string): Promise<Event> {
    return this.updateEvent(id, { status: 'published' });
  }

  async unpublishEvent(id: string): Promise<Event> {
    return this.updateEvent(id, { status: 'draft' });
  }

  async addArtistToEvent(eventId: string, artistId: string, setTime?: string): Promise<void> {
    const { error } = await this.supabase
      .from('event_artists')
      .insert({
        event_id: eventId,
        artist_id: artistId,
        set_time: setTime,
      });

    if (error) {
      throw ErrorResponses.databaseError('Failed to add artist to event', error);
    }
  }

  async removeArtistFromEvent(eventId: string, artistId: string): Promise<void> {
    const { error } = await this.supabase
      .from('event_artists')
      .delete()
      .eq('event_id', eventId)
      .eq('artist_id', artistId);

    if (error) {
      throw ErrorResponses.databaseError('Failed to remove artist from event', error);
    }
  }

  async getEventSalesStats(eventId: string): Promise<{
    totalRevenue: number;
    ticketsSold: number;
    ticketsAvailable: number;
  }> {
    const { data, error } = await this.supabase
      .from('ticket_types')
      .select('price, quantity_sold, quantity_available')
      .eq('event_id', eventId);

    if (error) {
      throw ErrorResponses.databaseError('Failed to fetch sales stats', error);
    }

    const totalRevenue = data.reduce((sum, tt) => sum + (parseFloat(tt.price) * tt.quantity_sold), 0);
    const ticketsSold = data.reduce((sum, tt) => sum + tt.quantity_sold, 0);
    const ticketsAvailable = data.reduce((sum, tt) => sum + tt.quantity_available, 0);

    return { totalRevenue, ticketsSold, ticketsAvailable };
  }
}
