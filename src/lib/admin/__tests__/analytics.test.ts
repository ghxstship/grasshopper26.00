/**
 * Analytics System Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getSalesMetrics, getMembershipMetrics } from '../analytics';

const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
  })),
};

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => mockSupabase),
}));

describe('Analytics System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getSalesMetrics', () => {
    it('should calculate sales metrics correctly', async () => {
      const mockOrders = [
        { total_amount: 10000, status: 'completed', refunded_amount: 0 },
        { total_amount: 5000, status: 'completed', refunded_amount: 0 },
        { total_amount: 3000, status: 'completed', refunded_amount: 1000 },
      ];

      mockSupabase.from().select.mockResolvedValueOnce({
        data: mockOrders,
        error: null,
      });

      const metrics = await getSalesMetrics('2025-01-01', '2025-01-31');

      expect(metrics.totalRevenue).toBe(18000);
      expect(metrics.ticketsSold).toBe(3);
      expect(metrics.refundedAmount).toBe(1000);
      expect(metrics.netRevenue).toBe(17000);
      expect(metrics.averageTicketPrice).toBe(6000);
    });
  });

  describe('getMembershipMetrics', () => {
    it('should calculate membership metrics', async () => {
      const mockMemberships = [
        {
          status: 'active',
          created_at: '2025-01-15',
          membership_tiers: { tier_name: 'Main', monthly_price: 1999 },
        },
        {
          status: 'active',
          created_at: '2025-01-20',
          membership_tiers: { tier_name: 'Extra', monthly_price: 4999 },
        },
      ];

      mockSupabase.from().select.mockResolvedValueOnce({
        data: mockMemberships,
        error: null,
      });

      const metrics = await getMembershipMetrics();

      expect(metrics.totalMembers).toBe(2);
      expect(metrics.activeMembers).toBe(2);
      expect(metrics.mrr).toBeGreaterThan(0);
    });
  });
});
