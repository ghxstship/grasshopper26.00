/**
 * Waitlist System Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { joinWaitlist, getWaitlistPosition } from '../waitlist';

// Create persistent query builder with proper chaining
const createMockQueryBuilder = () => {
  const builder: any = {};
  builder.select = vi.fn().mockReturnValue(builder);
  builder.insert = vi.fn().mockReturnValue(builder);
  builder.update = vi.fn().mockReturnValue(builder);
  builder.delete = vi.fn().mockReturnValue(builder);
  builder.eq = vi.fn().mockReturnValue(builder);
  builder.gt = vi.fn().mockReturnValue(builder);
  builder.single = vi.fn();
  builder.order = vi.fn().mockReturnValue(builder);
  builder.limit = vi.fn().mockReturnValue(builder);
  // For queries that don't end with .single()
  builder.then = vi.fn((resolve) => resolve({ data: null, error: null }));
  return builder;
};

let mockQueryBuilder = createMockQueryBuilder();

const mockSupabase: any = {
  from: vi.fn(() => mockQueryBuilder),
};

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => mockSupabase),
}));

describe('Waitlist System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockQueryBuilder = createMockQueryBuilder();
  });

  describe('joinWaitlist', () => {
    it('should add user to waitlist with correct priority', async () => {
      let fromCallCount = 0;
      
      mockSupabase.from = vi.fn((table: string) => {
        fromCallCount++;
        const builder = createMockQueryBuilder();
        
        if (fromCallCount === 1) {
          // First call: check existing entry
          builder.select.mockReturnValue(builder);
          builder.eq.mockReturnValue(builder);
          builder.single.mockResolvedValue({ data: null, error: { code: 'PGRST116' } });
        } else if (fromCallCount === 2) {
          // Second call: get membership tier
          builder.select.mockReturnValue(builder);
          builder.eq.mockReturnValue(builder);
          builder.single.mockResolvedValue({
            data: { membership_tiers: { tier_level: 3 } },
            error: null,
          });
        } else if (fromCallCount === 3) {
          // Third call: insert
          builder.insert.mockReturnValue(builder);
          builder.then = vi.fn((resolve) => resolve({ data: null, error: null }));
        } else {
          // Fourth+ calls: get position (needs multiple eq chains)
          builder.select.mockReturnValue(builder);
          builder.eq.mockReturnValue(builder);
          builder.gt.mockReturnValue(builder);
          builder.then = vi.fn((resolve) => resolve({ data: [], error: null }));
        }
        
        return builder;
      });

      const result = await joinWaitlist('event-123', 'user-456', 'ticket-type-789');

      expect(result.position).toBe(1);
      expect(result.priorityScore).toBeGreaterThan(0);
    });

    it('should throw error if already on waitlist', async () => {
      const testBuilder = createMockQueryBuilder();
      testBuilder.select.mockReturnValue(testBuilder);
      testBuilder.eq.mockReturnValue(testBuilder);
      testBuilder.single.mockResolvedValue({
        data: { id: 'existing-123' },
        error: null,
      });
      
      mockSupabase.from = vi.fn(() => testBuilder);

      await expect(
        joinWaitlist('event-123', 'user-456', 'ticket-type-789')
      ).rejects.toThrow('already on the waitlist');
    });
  });

  describe('getWaitlistPosition', () => {
    it('should return correct position', async () => {
      let fromCallCount = 0;
      
      mockSupabase.from = vi.fn(() => {
        fromCallCount++;
        const builder = createMockQueryBuilder();
        
        if (fromCallCount === 1) {
          // First call: get user entry
          builder.select.mockReturnValue(builder);
          builder.eq.mockReturnValue(builder);
          builder.single.mockResolvedValue({
            data: { priority_score: 50 },
            error: null,
          });
        } else if (fromCallCount === 2) {
          // Second call: count higher priority
          builder.select.mockReturnValue(builder);
          builder.eq.mockReturnValue(builder);
          builder.gt.mockReturnValue(builder);
          builder.then = vi.fn((resolve) => resolve({
            data: [{ id: '1' }, { id: '2' }],
            error: null,
          }));
        } else {
          // Third call: count total
          builder.select.mockReturnValue(builder);
          builder.eq.mockReturnValue(builder);
          builder.then = vi.fn((resolve) => resolve({
            data: [{ id: '1' }, { id: '2' }, { id: '3' }],
            error: null,
          }));
        }
        
        return builder;
      });

      const result = await getWaitlistPosition('user-456', 'event-123', 'ticket-type-789');

      expect(result).toEqual({ position: 3, total: 3 });
    });
  });
});
