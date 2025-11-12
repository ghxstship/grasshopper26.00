/**
 * Waitlist System Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { joinWaitlist, getWaitlistPosition } from '../waitlist';

// Create persistent query builder
const mockQueryBuilder = {
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  gt: vi.fn().mockReturnThis(),
  single: vi.fn(),
  order: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
};

const mockSupabase = {
  from: vi.fn(() => mockQueryBuilder),
};

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => mockSupabase),
}));

describe('Waitlist System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('joinWaitlist', () => {
    it('should add user to waitlist with correct priority', async () => {
      // Mock no existing entry (first call - check existing)
      mockQueryBuilder.single
        .mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } })
        // Mock membership tier (second call)
        .mockResolvedValueOnce({
          data: { membership_tiers: { tier_level: 3 } },
          error: null,
        })
        // Mock insert result (third call)
        .mockResolvedValueOnce({ 
          data: { id: 'new-entry', priority_score: 42 },
          error: null 
        });

      // Mock position query
      mockQueryBuilder.select.mockResolvedValueOnce({ data: [], error: null });

      const result = await joinWaitlist('event-123', 'user-456', 'ticket-type-789');

      expect(result.position).toBe(1);
      expect(result.priorityScore).toBeGreaterThan(0);
    });

    it('should throw error if already on waitlist', async () => {
      mockQueryBuilder.single.mockResolvedValueOnce({
        data: { id: 'existing-123' },
        error: null,
      });

      await expect(
        joinWaitlist('event-123', 'user-456', 'ticket-type-789')
      ).rejects.toThrow('already on the waitlist');
    });
  });

  describe('getWaitlistPosition', () => {
    it('should return correct position', async () => {
      // Mock user entry (first single call)
      mockQueryBuilder.single.mockResolvedValueOnce({
        data: { priority_score: 50 },
        error: null,
      });

      // Mock higher priority count (first select call - returns promise with count)
      mockQueryBuilder.select
        .mockReturnValueOnce(Promise.resolve({
          data: [{ id: '1' }, { id: '2' }],
          error: null,
          count: 2
        }))
        // Mock total waiting (second select call)
        .mockReturnValueOnce(Promise.resolve({
          data: [{ id: '1' }, { id: '2' }, { id: '3' }],
          error: null,
          count: 3
        }));

      const result = await getWaitlistPosition('user-456', 'event-123', 'ticket-type-789');

      expect(result).toEqual({ position: 3, total: 3 });
    });
  });
});
