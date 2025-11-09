/**
 * Admin API Route Tests
 * Tests admin endpoints for events, analytics, and order management
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET as GetEventsGET, POST as CreateEventPOST } from '@/app/api/admin/events/route';
import { GET as GetAnalyticsGET } from '@/app/api/admin/analytics/route';
import { POST as RefundOrderPOST } from '@/app/api/admin/orders/[id]/refund/route';

describe('Admin API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/admin/events', () => {
    it('should return events for admin user', async () => {
      const request = new Request('http://localhost:3000/api/admin/events', {
        method: 'GET',
        headers: {
          Authorization: 'Bearer admin-token',
        },
      });

      const response = await GetEventsGET(request);
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data.events)).toBe(true);
    });

    it('should reject non-admin users', async () => {
      const request = new Request('http://localhost:3000/api/admin/events', {
        method: 'GET',
        headers: {
          Authorization: 'Bearer user-token',
        },
      });

      const response = await GetEventsGET(request);
      expect(response.status).toBe(403);
    });

    it('should support pagination', async () => {
      const request = new Request('http://localhost:3000/api/admin/events?page=2&limit=10', {
        method: 'GET',
        headers: {
          Authorization: 'Bearer admin-token',
        },
      });

      const response = await GetEventsGET(request);
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('pagination');
    });
  });

  describe('POST /api/admin/events', () => {
    it('should create event with valid data', async () => {
      const request = new Request('http://localhost:3000/api/admin/events', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer admin-token',
        },
        body: JSON.stringify({
          title: 'Test Event',
          description: 'Test Description',
          date: '2025-12-31T20:00:00Z',
          venueId: 'venue-123',
          artistIds: ['artist-1', 'artist-2'],
        }),
      });

      const response = await CreateEventPOST(request);
      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data).toHaveProperty('eventId');
    });

    it('should validate required fields', async () => {
      const request = new Request('http://localhost:3000/api/admin/events', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer admin-token',
        },
        body: JSON.stringify({
          title: 'Test Event',
        }),
      });

      const response = await CreateEventPOST(request);
      expect(response.status).toBe(400);
    });

    it('should validate date is in future', async () => {
      const request = new Request('http://localhost:3000/api/admin/events', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer admin-token',
        },
        body: JSON.stringify({
          title: 'Test Event',
          description: 'Test Description',
          date: '2020-01-01T20:00:00Z',
          venueId: 'venue-123',
        }),
      });

      const response = await CreateEventPOST(request);
      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/admin/analytics', () => {
    it('should return analytics dashboard data', async () => {
      const request = new Request('http://localhost:3000/api/admin/analytics', {
        method: 'GET',
        headers: {
          Authorization: 'Bearer admin-token',
        },
      });

      const response = await GetAnalyticsGET(request);
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('revenue');
      expect(data).toHaveProperty('ticketsSold');
      expect(data).toHaveProperty('activeMembers');
    });

    it('should support date range filtering', async () => {
      const request = new Request(
        'http://localhost:3000/api/admin/analytics?startDate=2025-01-01&endDate=2025-12-31',
        {
          method: 'GET',
          headers: {
            Authorization: 'Bearer admin-token',
          },
        }
      );

      const response = await GetAnalyticsGET(request);
      expect(response.status).toBe(200);
    });
  });

  describe('POST /api/admin/orders/[id]/refund', () => {
    it('should process refund for valid order', async () => {
      const request = new Request('http://localhost:3000/api/admin/orders/order-123/refund', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer admin-token',
        },
        body: JSON.stringify({
          reason: 'Customer request',
          amount: 5000,
        }),
      });

      const response = await RefundOrderPOST(request, { params: { id: 'order-123' } });
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('refundId');
    });

    it('should reject refund for already refunded order', async () => {
      const request = new Request('http://localhost:3000/api/admin/orders/refunded-order/refund', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer admin-token',
        },
        body: JSON.stringify({
          reason: 'Customer request',
        }),
      });

      const response = await RefundOrderPOST(request, { params: { id: 'refunded-order' } });
      expect(response.status).toBe(409);
    });

    it('should validate refund amount', async () => {
      const request = new Request('http://localhost:3000/api/admin/orders/order-123/refund', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer admin-token',
        },
        body: JSON.stringify({
          reason: 'Customer request',
          amount: 999999,
        }),
      });

      const response = await RefundOrderPOST(request, { params: { id: 'order-123' } });
      expect(response.status).toBe(400);
    });
  });
});
