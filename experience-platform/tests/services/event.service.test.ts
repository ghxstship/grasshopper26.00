import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EventService } from '@/lib/services/event.service';
import { createClient } from '@/lib/supabase/server';

// Mock Supabase client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

describe('EventService', () => {
  let eventService: EventService;
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
    };

    (createClient as any).mockResolvedValue(mockSupabase);
    eventService = new EventService(mockSupabase);
  });

  describe('createEvent', () => {
    it('should create an event successfully', async () => {
      const mockEvent = {
        id: 'event-123',
        name: 'Test Event',
        brand_id: 'brand-123',
        slug: 'test-event',
        start_date: '2025-08-01T19:00:00Z',
      };

      mockSupabase.single.mockResolvedValue({
        data: mockEvent,
        error: null,
      });

      const result = await eventService.createEvent(mockEvent as any);

      expect(result).toEqual(mockEvent);
      expect(mockSupabase.from).toHaveBeenCalledWith('events');
      expect(mockSupabase.insert).toHaveBeenCalledWith(mockEvent);
    });

    it('should throw error when creation fails', async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      await expect(
        eventService.createEvent({} as any)
      ).rejects.toThrow();
    });
  });

  describe('getEventById', () => {
    it('should retrieve event with related data', async () => {
      const mockEvent = {
        id: 'event-123',
        name: 'Test Event',
        event_artists: [
          {
            artist_id: 'artist-123',
            artists: {
              id: 'artist-123',
              name: 'Test Artist',
            },
          },
        ],
        ticket_types: [
          {
            id: 'ticket-123',
            name: 'General Admission',
            price: '50.00',
          },
        ],
      };

      mockSupabase.single.mockResolvedValue({
        data: mockEvent,
        error: null,
      });

      const result = await eventService.getEventById('event-123');

      expect(result).toEqual(mockEvent);
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', 'event-123');
    });

    it('should throw error when event not found', async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { message: 'Not found' },
      });

      await expect(
        eventService.getEventById('invalid-id')
      ).rejects.toThrow('Event not found');
    });
  });

  describe('listEvents', () => {
    it('should list events with pagination', async () => {
      const mockEvents = [
        { id: 'event-1', name: 'Event 1' },
        { id: 'event-2', name: 'Event 2' },
      ];

      mockSupabase.range.mockResolvedValue({
        data: mockEvents,
        error: null,
        count: 50,
      });

      const result = await eventService.listEvents({
        limit: 20,
        offset: 0,
      });

      expect(result.events).toEqual(mockEvents);
      expect(result.total).toBe(50);
      expect(mockSupabase.limit).toHaveBeenCalledWith(20);
    });

    it('should filter events by status', async () => {
      mockSupabase.range.mockResolvedValue({
        data: [],
        error: null,
        count: 0,
      });

      await eventService.listEvents({
        status: 'published',
      });

      expect(mockSupabase.eq).toHaveBeenCalledWith('status', 'published');
    });

    it('should filter events by date range', async () => {
      mockSupabase.range.mockResolvedValue({
        data: [],
        error: null,
        count: 0,
      });

      await eventService.listEvents({
        startDate: '2025-01-01',
        endDate: '2025-12-31',
      });

      expect(mockSupabase.gte).toHaveBeenCalledWith('start_date', '2025-01-01');
      expect(mockSupabase.lte).toHaveBeenCalledWith('start_date', '2025-12-31');
    });
  });

  describe('updateEvent', () => {
    it('should update event successfully', async () => {
      const mockUpdatedEvent = {
        id: 'event-123',
        name: 'Updated Event',
      };

      mockSupabase.single.mockResolvedValue({
        data: mockUpdatedEvent,
        error: null,
      });

      const result = await eventService.updateEvent('event-123', {
        name: 'Updated Event',
      });

      expect(result).toEqual(mockUpdatedEvent);
      expect(mockSupabase.update).toHaveBeenCalledWith({ name: 'Updated Event' });
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', 'event-123');
    });
  });

  describe('deleteEvent', () => {
    it('should delete event successfully', async () => {
      mockSupabase.delete.mockResolvedValue({
        error: null,
      });

      await eventService.deleteEvent('event-123');

      expect(mockSupabase.from).toHaveBeenCalledWith('events');
      expect(mockSupabase.delete).toHaveBeenCalled();
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', 'event-123');
    });
  });

  describe('publishEvent', () => {
    it('should publish event', async () => {
      const mockPublishedEvent = {
        id: 'event-123',
        status: 'published',
      };

      mockSupabase.single.mockResolvedValue({
        data: mockPublishedEvent,
        error: null,
      });

      const result = await eventService.publishEvent('event-123');

      expect(result.status).toBe('published');
    });
  });

  describe('getEventSalesStats', () => {
    it('should calculate sales statistics', async () => {
      const mockTicketTypes = [
        { price: '50.00', quantity_sold: 100, quantity_available: 500 },
        { price: '75.00', quantity_sold: 50, quantity_available: 200 },
      ];

      mockSupabase.select.mockResolvedValue({
        data: mockTicketTypes,
        error: null,
      });

      const result = await eventService.getEventSalesStats('event-123');

      expect(result.totalRevenue).toBe(8750); // (50 * 100) + (75 * 50)
      expect(result.ticketsSold).toBe(150);
      expect(result.ticketsAvailable).toBe(700);
    });
  });
});
