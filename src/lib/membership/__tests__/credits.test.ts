/**
 * Credit System Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getCreditBalance, allocateCredits, redeemCredits, hasCredits } from '../credits';

// Create persistent query builder
const mockQueryBuilder = {
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  single: vi.fn(),
  gte: vi.fn().mockReturnThis(),
  lte: vi.fn().mockReturnThis(),
};

// Mock Supabase
const mockSupabase = {
  from: vi.fn(() => mockQueryBuilder),
};

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => mockSupabase),
}));

describe('Credit System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCreditBalance', () => {
    it('should return credit balance', async () => {
      const mockBalance = { credits_balance: 10 };
      mockQueryBuilder.single.mockResolvedValueOnce({ data: mockBalance, error: null });
      mockQueryBuilder.select.mockResolvedValueOnce({ data: [], error: null });

      const balance = await getCreditBalance('membership-123');

      expect(balance.total).toBe(10);
      expect(mockSupabase.from).toHaveBeenCalledWith('ticket_credits_ledger');
    });

    it('should return zero for no credits', async () => {
      mockQueryBuilder.single.mockResolvedValueOnce({ 
        data: null, 
        error: { code: 'PGRST116' } 
      });
      mockQueryBuilder.select.mockResolvedValueOnce({ data: [], error: null });

      const balance = await getCreditBalance('membership-123');

      expect(balance.total).toBe(0);
    });

    it('should throw error on database failure', async () => {
      mockQueryBuilder.single.mockResolvedValueOnce({ 
        data: null, 
        error: { message: 'Database error', code: 'ERROR' } 
      });

      await expect(getCreditBalance('membership-123')).rejects.toThrow('Failed to get credit balance');
    });
  });

  describe('allocateCredits', () => {
    it('should allocate credits successfully', async () => {
      const mockBalance = { credits_balance: 5 };
      const mockTransaction = { 
        id: 'txn-123', 
        credits_change: 2, 
        credits_balance: 7 
      };

      mockQueryBuilder.single.mockResolvedValueOnce({ data: mockBalance, error: null });
      mockQueryBuilder.select.mockResolvedValueOnce({ data: [], error: null });
      mockQueryBuilder.single.mockResolvedValueOnce({ data: mockTransaction, error: null });
      mockQueryBuilder.update.mockResolvedValueOnce({ error: null });

      const result = await allocateCredits('membership-123', 2);

      expect(result.credits_change).toBe(2);
      expect(result.credits_balance).toBe(7);
    });
  });

  describe('redeemCredits', () => {
    it('should redeem credits successfully', async () => {
      const mockBalance = { credits_balance: 5 };
      const mockTransaction = { 
        id: 'txn-123', 
        credits_change: -2, 
        credits_balance: 3 
      };

      mockQueryBuilder.single.mockResolvedValueOnce({ data: mockBalance, error: null });
      mockQueryBuilder.select.mockResolvedValueOnce({ data: [], error: null });
      mockQueryBuilder.single.mockResolvedValueOnce({ data: mockTransaction, error: null });
      mockQueryBuilder.update.mockResolvedValueOnce({ error: null });
      mockQueryBuilder.insert.mockResolvedValueOnce({ error: null });

      const result = await redeemCredits('membership-123', 2, 'order-123', 'event-123');

      expect(result.credits_change).toBe(-2);
      expect(result.credits_balance).toBe(3);
    });

    it('should throw error for insufficient credits', async () => {
      const mockBalance = { credits_balance: 1 };

      mockQueryBuilder.single.mockResolvedValueOnce({ data: mockBalance, error: null });
      mockQueryBuilder.select.mockResolvedValueOnce({ data: [], error: null });

      await expect(
        redeemCredits('membership-123', 5, 'order-123', 'event-123')
      ).rejects.toThrow('Insufficient credits');
    });
  });

  describe('hasCredits', () => {
    it('should return true when sufficient credits', async () => {
      const mockBalance = { credits_balance: 10 };

      mockQueryBuilder.single.mockResolvedValueOnce({ data: mockBalance, error: null });
      mockQueryBuilder.select.mockResolvedValueOnce({ data: [], error: null });

      const result = await hasCredits('membership-123', 5);

      expect(result).toBe(true);
    });

    it('should return false when insufficient credits', async () => {
      const mockBalance = { credits_balance: 2 };

      mockQueryBuilder.single.mockResolvedValueOnce({ data: mockBalance, error: null });
      mockQueryBuilder.select.mockResolvedValueOnce({ data: [], error: null });

      const result = await hasCredits('membership-123', 5);

      expect(result).toBe(false);
    });
  });
});
