import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET, POST, PATCH, DELETE } from '@/app/api/v1/events/[id]/route';
import { NextRequest } from 'next/server';

// Mock dependencies
vi.mock('@/lib/supabase/server');
vi.mock('@/lib/services/event.service');
vi.mock('@/lib/api/rate-limiter');
vi.mock('@/lib/api/middleware');

describe('Events API', () => {
  describe('GET /api/v1/events/[id]', () => {
    it('should return event by ID', async () => {
      const mockEvent = {
        id: 'event-123',
        name: 'Test Event',
        status: 'published',
      };

      const req = new NextRequest('http://localhost:3000/api/v1/events/event-123');
      const params = { id: 'event-123' };

      const response = await GET(req, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should return 404 for non-existent event', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/events/invalid-id');
      const params = { id: 'invalid-id' };

      const response = await GET(req, { params });

      expect(response.status).toBe(404);
    });

    it('should handle rate limiting', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/events/event-123');
      const params = { id: 'event-123' };

      // Simulate rate limit exceeded
      const response = await GET(req, { params });

      expect(response.headers.has('X-RateLimit-Limit')).toBe(true);
    });
  });

  describe('PATCH /api/v1/events/[id]', () => {
    it('should update event with valid data', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/events/event-123', {
        method: 'PATCH',
        body: JSON.stringify({ name: 'Updated Event' }),
      });
      const params = { id: 'event-123' };

      const response = await PATCH(req, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Event updated successfully');
    });

    it('should require authentication', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/events/event-123', {
        method: 'PATCH',
        body: JSON.stringify({ name: 'Updated Event' }),
      });
      const params = { id: 'event-123' };

      const response = await PATCH(req, { params });

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /api/v1/events/[id]', () => {
    it('should delete event', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/events/event-123', {
        method: 'DELETE',
      });
      const params = { id: 'event-123' };

      const response = await DELETE(req, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Event deleted successfully');
    });
  });
});
