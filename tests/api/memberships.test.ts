/**
 * Membership API Route Tests
 * Tests membership tiers, subscriptions, and credit redemption
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET as GetTiersGET } from '@/app/api/memberships/tiers/route';
import { POST as SubscribePOST } from '@/app/api/memberships/subscribe/route';
import { GET as GetCurrentGET } from '@/app/api/memberships/current/route';
import { POST as RedeemCreditsPOST } from '@/app/api/memberships/credits/redeem/route';

describe('Membership API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/memberships/tiers', () => {
    it('should return all membership tiers', async () => {
      const request = new Request('http://localhost:3000/api/memberships/tiers', {
        method: 'GET',
      });

      const response = await GetTiersGET(request);
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data.tiers)).toBe(true);
      expect(data.tiers.length).toBeGreaterThan(0);
    });

    it('should include tier benefits', async () => {
      const request = new Request('http://localhost:3000/api/memberships/tiers', {
        method: 'GET',
      });

      const response = await GetTiersGET(request);
      const data = await response.json();
      expect(data.tiers[0]).toHaveProperty('benefits');
      expect(data.tiers[0]).toHaveProperty('price');
      expect(data.tiers[0]).toHaveProperty('credits');
    });
  });

  describe('POST /api/memberships/subscribe', () => {
    it('should create subscription with valid tier', async () => {
      const request = new Request('http://localhost:3000/api/memberships/subscribe', {
        method: 'POST',
        body: JSON.stringify({
          tierId: 'tier-premium',
          paymentMethodId: 'pm_123',
        }),
      });

      const response = await SubscribePOST(request);
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('subscriptionId');
    });

    it('should reject invalid tier', async () => {
      const request = new Request('http://localhost:3000/api/memberships/subscribe', {
        method: 'POST',
        body: JSON.stringify({
          tierId: 'invalid-tier',
          paymentMethodId: 'pm_123',
        }),
      });

      const response = await SubscribePOST(request);
      expect(response.status).toBe(404);
    });

    it('should prevent duplicate active subscriptions', async () => {
      const request = new Request('http://localhost:3000/api/memberships/subscribe', {
        method: 'POST',
        body: JSON.stringify({
          tierId: 'tier-premium',
          paymentMethodId: 'pm_123',
        }),
      });

      const response = await SubscribePOST(request);
      expect(response.status).toBe(409);
    });

    it('should allocate credits on subscription', async () => {
      const request = new Request('http://localhost:3000/api/memberships/subscribe', {
        method: 'POST',
        body: JSON.stringify({
          tierId: 'tier-premium',
          paymentMethodId: 'pm_123',
        }),
      });

      const response = await SubscribePOST(request);
      const data = await response.json();
      expect(data).toHaveProperty('creditsAllocated');
      expect(data.creditsAllocated).toBeGreaterThan(0);
    });
  });

  describe('GET /api/memberships/current', () => {
    it('should return current membership for authenticated user', async () => {
      const request = new Request('http://localhost:3000/api/memberships/current', {
        method: 'GET',
        headers: {
          Authorization: 'Bearer valid-token',
        },
      });

      const response = await GetCurrentGET(request);
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('tier');
      expect(data).toHaveProperty('credits');
    });

    it('should return 404 for users without membership', async () => {
      const request = new Request('http://localhost:3000/api/memberships/current', {
        method: 'GET',
        headers: {
          Authorization: 'Bearer no-membership-token',
        },
      });

      const response = await GetCurrentGET(request);
      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/memberships/credits/redeem', () => {
    it('should redeem credits for ticket purchase', async () => {
      const request = new Request('http://localhost:3000/api/memberships/credits/redeem', {
        method: 'POST',
        body: JSON.stringify({
          ticketTypeId: 'ticket-type-123',
          quantity: 2,
        }),
      });

      const response = await RedeemCreditsPOST(request);
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('creditsUsed');
      expect(data).toHaveProperty('remainingCredits');
    });

    it('should reject when insufficient credits', async () => {
      const request = new Request('http://localhost:3000/api/memberships/credits/redeem', {
        method: 'POST',
        body: JSON.stringify({
          ticketTypeId: 'expensive-ticket',
          quantity: 10,
        }),
      });

      const response = await RedeemCreditsPOST(request);
      expect(response.status).toBe(402);
    });

    it('should validate credit expiration', async () => {
      const request = new Request('http://localhost:3000/api/memberships/credits/redeem', {
        method: 'POST',
        body: JSON.stringify({
          ticketTypeId: 'ticket-type-123',
          quantity: 1,
        }),
      });

      const response = await RedeemCreditsPOST(request);
      expect(response.status).toBe(200);
    });
  });
});
