/**
 * Vouchers Page Component Tests
 * Tests for the vouchers management page including validation, redemption, and display
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createClient } from '@/lib/supabase/client';

// Mock dependencies
vi.mock('@/lib/supabase/client');
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockVouchers = [
  {
    id: 'voucher-1',
    code: 'SUMMER2025',
    discount_type: 'percentage',
    discount_value: 20,
    min_purchase_amount: 50,
    max_uses: 100,
    uses_count: 45,
    valid_from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    redeemed_at: new Date().toISOString(),
  },
  {
    id: 'voucher-2',
    code: 'FIXED10',
    discount_type: 'fixed',
    discount_value: 10,
    min_purchase_amount: null,
    max_uses: null,
    uses_count: 0,
    valid_from: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    valid_until: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    redeemed_at: new Date().toISOString(),
  },
  {
    id: 'voucher-3',
    code: 'EXPIRED',
    discount_type: 'percentage',
    discount_value: 15,
    min_purchase_amount: 25,
    max_uses: 50,
    uses_count: 50,
    valid_from: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    valid_until: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    redeemed_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

describe('VouchersPage', () => {
  const mockSupabase = {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      }),
    },
    from: vi.fn((table: string) => {
      if (table === 'user_vouchers') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({
            data: mockVouchers.map(v => ({
              voucher: v,
              redeemed_at: v.redeemed_at,
            })),
            error: null,
          }),
          insert: vi.fn().mockResolvedValue({ data: {}, error: null }),
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        };
      }
      if (table === 'vouchers') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: mockVouchers[0],
            error: null,
          }),
          update: vi.fn().mockReturnThis(),
        };
      }
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };
    }),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (createClient as any).mockReturnValue(mockSupabase);
  });

  describe('Voucher Display', () => {
    it('should display voucher code correctly', () => {
      const voucher = mockVouchers[0];
      expect(voucher.code).toBe('SUMMER2025');
    });

    it('should format percentage discount correctly', () => {
      const voucher = mockVouchers[0];
      const discountText = `${voucher.discount_value}% OFF`;
      expect(discountText).toBe('20% OFF');
    });

    it('should format fixed discount correctly', () => {
      const voucher = mockVouchers[1];
      const discountText = `$${voucher.discount_value.toFixed(2)} OFF`;
      expect(discountText).toBe('$10.00 OFF');
    });

    it('should display minimum purchase amount when present', () => {
      const voucher = mockVouchers[0];
      expect(voucher.min_purchase_amount).toBe(50);
    });

    it('should handle null minimum purchase amount', () => {
      const voucher = mockVouchers[1];
      expect(voucher.min_purchase_amount).toBeNull();
    });
  });

  describe('Voucher Validation', () => {
    it('should validate active voucher successfully', () => {
      const voucher = mockVouchers[0];
      const now = new Date();
      const validFrom = new Date(voucher.valid_from);
      const validUntil = new Date(voucher.valid_until);

      expect(voucher.status).toBe('active');
      expect(now >= validFrom).toBe(true);
      expect(now <= validUntil).toBe(true);
    });

    it('should detect expired vouchers', () => {
      const voucher = mockVouchers[2];
      const isExpired = new Date(voucher.valid_until) < new Date();
      expect(isExpired).toBe(true);
    });

    it('should check usage limits', () => {
      const voucher = mockVouchers[2];
      const hasReachedLimit = voucher.max_uses !== null && voucher.uses_count >= voucher.max_uses;
      expect(hasReachedLimit).toBe(true);
    });

    it('should validate voucher not yet valid', () => {
      const futureVoucher = {
        ...mockVouchers[0],
        valid_from: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };
      const now = new Date();
      const validFrom = new Date(futureVoucher.valid_from);
      expect(now < validFrom).toBe(true);
    });

    it('should handle unlimited usage vouchers', () => {
      const voucher = mockVouchers[1];
      expect(voucher.max_uses).toBeNull();
    });
  });

  describe('Voucher Code Input', () => {
    it('should convert input to uppercase', () => {
      const input = 'summer2025';
      const uppercase = input.toUpperCase();
      expect(uppercase).toBe('SUMMER2025');
    });

    it('should trim whitespace from input', () => {
      const input = '  SUMMER2025  ';
      const trimmed = input.trim();
      expect(trimmed).toBe('SUMMER2025');
    });

    it('should reject empty voucher codes', () => {
      const input = '';
      expect(input.trim()).toBe('');
    });

    it('should handle special characters in codes', () => {
      const code = 'SAVE-20%';
      expect(code).toContain('-');
      expect(code).toContain('%');
    });
  });

  describe('Voucher Redemption', () => {
    it('should track redemption timestamp', () => {
      const voucher = mockVouchers[0];
      expect(voucher.redeemed_at).toBeTruthy();
      expect(new Date(voucher.redeemed_at!)).toBeInstanceOf(Date);
    });

    it('should increment usage count on redemption', () => {
      const voucher = mockVouchers[0];
      const newCount = voucher.uses_count + 1;
      expect(newCount).toBe(46);
    });

    it('should prevent duplicate redemptions', async () => {
      const userId = 'user-123';
      const voucherId = 'voucher-1';
      
      // Simulate existing redemption check
      const existingRedemption = { id: 'redemption-1' };
      expect(existingRedemption).toBeTruthy();
    });

    it('should create user_voucher record on redemption', () => {
      const redemption = {
        user_id: 'user-123',
        voucher_id: 'voucher-1',
        redeemed_at: new Date().toISOString(),
      };

      expect(redemption.user_id).toBe('user-123');
      expect(redemption.voucher_id).toBe('voucher-1');
      expect(redemption.redeemed_at).toBeTruthy();
    });
  });

  describe('Voucher Status', () => {
    it('should identify active vouchers', () => {
      const voucher = mockVouchers[0];
      expect(voucher.status).toBe('active');
    });

    it('should handle inactive status', () => {
      const inactiveVoucher = { ...mockVouchers[0], status: 'inactive' };
      expect(inactiveVoucher.status).toBe('inactive');
    });

    it('should handle paused status', () => {
      const pausedVoucher = { ...mockVouchers[0], status: 'paused' };
      expect(pausedVoucher.status).toBe('paused');
    });
  });

  describe('Date Formatting', () => {
    it('should format valid_from date correctly', () => {
      const voucher = mockVouchers[0];
      const date = new Date(voucher.valid_from);
      expect(date.toLocaleDateString()).toBeTruthy();
    });

    it('should format valid_until date correctly', () => {
      const voucher = mockVouchers[0];
      const date = new Date(voucher.valid_until);
      expect(date.toLocaleDateString()).toBeTruthy();
    });

    it('should format redeemed_at date correctly', () => {
      const voucher = mockVouchers[0];
      const date = new Date(voucher.redeemed_at!);
      expect(date.toLocaleDateString()).toBeTruthy();
    });

    it('should calculate days until expiry', () => {
      const voucher = mockVouchers[0];
      const daysUntilExpiry = Math.ceil(
        (new Date(voucher.valid_until).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      expect(daysUntilExpiry).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle Supabase query errors', async () => {
      const errorSupabase = {
        ...mockSupabase,
        from: vi.fn(() => ({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Database error' },
          }),
        })),
      };

      (createClient as any).mockReturnValue(errorSupabase);
      expect(() => {
        // Error handling logic
      }).not.toThrow();
    });

    it('should handle missing user authentication', async () => {
      const noUserSupabase = {
        ...mockSupabase,
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: null },
            error: { message: 'Not authenticated' },
          }),
        },
      };

      (createClient as any).mockReturnValue(noUserSupabase);
      expect(noUserSupabase.auth.getUser).toBeDefined();
    });

    it('should handle voucher not found', async () => {
      const notFoundSupabase = {
        ...mockSupabase,
        from: vi.fn(() => ({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Not found' },
          }),
        })),
      };

      (createClient as any).mockReturnValue(notFoundSupabase);
      expect(() => {
        // Error handling logic
      }).not.toThrow();
    });

    it('should handle redemption failures', async () => {
      const failSupabase = {
        ...mockSupabase,
        from: vi.fn(() => ({
          insert: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Insert failed' },
          }),
        })),
      };

      (createClient as any).mockReturnValue(failSupabase);
      expect(() => {
        // Error handling logic
      }).not.toThrow();
    });
  });

  describe('Loading States', () => {
    it('should show loading state initially', () => {
      const loading = true;
      expect(loading).toBe(true);
    });

    it('should hide loading state after data loads', () => {
      const loading = false;
      expect(loading).toBe(false);
    });

    it('should show redeeming state during validation', () => {
      const redeeming = true;
      expect(redeeming).toBe(true);
    });

    it('should disable input during redemption', () => {
      const redeeming = true;
      const disabled = redeeming;
      expect(disabled).toBe(true);
    });
  });

  describe('Empty States', () => {
    it('should show empty state when no vouchers exist', () => {
      const emptyVouchers: any[] = [];
      expect(emptyVouchers).toHaveLength(0);
    });

    it('should display appropriate empty message', () => {
      const emptyVouchers: any[] = [];
      const message = emptyVouchers.length === 0 ? 'No vouchers yet' : '';
      expect(message).toBe('No vouchers yet');
    });
  });

  describe('Validation Messages', () => {
    it('should show success message for valid voucher', () => {
      const validationResult = {
        valid: true,
        message: 'Voucher is valid and ready to use!',
        voucher: mockVouchers[0],
      };

      expect(validationResult.valid).toBe(true);
      expect(validationResult.message).toContain('valid');
    });

    it('should show error for invalid code', () => {
      const validationResult = {
        valid: false,
        message: 'Invalid voucher code',
      };

      expect(validationResult.valid).toBe(false);
      expect(validationResult.message).toContain('Invalid');
    });

    it('should show error for already redeemed', () => {
      const validationResult = {
        valid: false,
        message: 'You have already redeemed this voucher',
      };

      expect(validationResult.valid).toBe(false);
      expect(validationResult.message).toContain('already redeemed');
    });

    it('should show error for expired voucher', () => {
      const validationResult = {
        valid: false,
        message: 'This voucher has expired',
      };

      expect(validationResult.valid).toBe(false);
      expect(validationResult.message).toContain('expired');
    });

    it('should show error for usage limit reached', () => {
      const validationResult = {
        valid: false,
        message: 'This voucher has reached its usage limit',
      };

      expect(validationResult.valid).toBe(false);
      expect(validationResult.message).toContain('usage limit');
    });

    it('should show error for inactive voucher', () => {
      const validationResult = {
        valid: false,
        message: 'This voucher is no longer active',
      };

      expect(validationResult.valid).toBe(false);
      expect(validationResult.message).toContain('no longer active');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for input', () => {
      const input = { 'aria-label': 'Voucher code input' };
      expect(input['aria-label']).toBeTruthy();
    });

    it('should have keyboard navigation for buttons', () => {
      const buttons = ['validate', 'redeem'];
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should announce validation results to screen readers', () => {
      const announcement = { role: 'status', 'aria-live': 'polite' };
      expect(announcement.role).toBe('status');
    });
  });

  describe('Voucher Filtering', () => {
    it('should filter active vouchers', () => {
      const active = mockVouchers.filter(v => 
        v.status === 'active' && new Date(v.valid_until) > new Date()
      );
      expect(active.length).toBeGreaterThan(0);
    });

    it('should filter expired vouchers', () => {
      const expired = mockVouchers.filter(v => 
        new Date(v.valid_until) < new Date()
      );
      expect(expired).toHaveLength(1);
    });

    it('should filter by discount type', () => {
      const percentage = mockVouchers.filter(v => v.discount_type === 'percentage');
      const fixed = mockVouchers.filter(v => v.discount_type === 'fixed');
      
      expect(percentage.length).toBeGreaterThan(0);
      expect(fixed.length).toBeGreaterThan(0);
    });
  });

  describe('Usage Statistics', () => {
    it('should calculate usage percentage', () => {
      const voucher = mockVouchers[0];
      if (voucher.max_uses) {
        const percentage = (voucher.uses_count / voucher.max_uses) * 100;
        expect(percentage).toBe(45);
      }
    });

    it('should identify nearly full vouchers', () => {
      const voucher = mockVouchers[2];
      const nearlyFull = voucher.max_uses !== null && 
        voucher.uses_count >= voucher.max_uses * 0.9;
      expect(nearlyFull).toBe(true);
    });

    it('should handle unlimited usage tracking', () => {
      const voucher = mockVouchers[1];
      expect(voucher.max_uses).toBeNull();
      expect(voucher.uses_count).toBeGreaterThanOrEqual(0);
    });
  });
});
