/**
 * Checkout API Route Tests
 * Tests checkout flow, session creation, and payment confirmation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST as CreateCheckoutPOST } from '@/app/api/checkout/create/route';
import { POST as CreateSessionPOST } from '@/app/api/checkout/create-session/route';
import { POST as ConfirmPOST } from '@/app/api/checkout/confirm/route';

describe('Checkout API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/checkout/create', () => {
    it('should create checkout with valid ticket selection', async () => {
      const request = new Request('http://localhost:3000/api/checkout/create', {
        method: 'POST',
        body: JSON.stringify({
          eventId: 'event-123',
          ticketTypeId: 'ticket-type-456',
          quantity: 2,
        }),
      });

      const response = await CreateCheckoutPOST(request);
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('checkoutId');
    });

    it('should reject invalid quantity', async () => {
      const request = new Request('http://localhost:3000/api/checkout/create', {
        method: 'POST',
        body: JSON.stringify({
          eventId: 'event-123',
          ticketTypeId: 'ticket-type-456',
          quantity: 0,
        }),
      });

      const response = await CreateCheckoutPOST(request);
      expect(response.status).toBe(400);
    });

    it('should reject when tickets sold out', async () => {
      const request = new Request('http://localhost:3000/api/checkout/create', {
        method: 'POST',
        body: JSON.stringify({
          eventId: 'sold-out-event',
          ticketTypeId: 'ticket-type-456',
          quantity: 1,
        }),
      });

      const response = await CreateCheckoutPOST(request);
      expect(response.status).toBe(409);
    });

    it('should enforce per-order limits', async () => {
      const request = new Request('http://localhost:3000/api/checkout/create', {
        method: 'POST',
        body: JSON.stringify({
          eventId: 'event-123',
          ticketTypeId: 'ticket-type-456',
          quantity: 100,
        }),
      });

      const response = await CreateCheckoutPOST(request);
      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/checkout/create-session', () => {
    it('should create Stripe session with valid checkout', async () => {
      const request = new Request('http://localhost:3000/api/checkout/create-session', {
        method: 'POST',
        body: JSON.stringify({
          checkoutId: 'checkout-123',
        }),
      });

      const response = await CreateSessionPOST(request);
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('sessionId');
      expect(data).toHaveProperty('url');
    });

    it('should reject invalid checkout ID', async () => {
      const request = new Request('http://localhost:3000/api/checkout/create-session', {
        method: 'POST',
        body: JSON.stringify({
          checkoutId: 'invalid-checkout',
        }),
      });

      const response = await CreateSessionPOST(request);
      expect(response.status).toBe(404);
    });

    it('should apply membership discounts', async () => {
      const request = new Request('http://localhost:3000/api/checkout/create-session', {
        method: 'POST',
        body: JSON.stringify({
          checkoutId: 'checkout-123',
          membershipTier: 'premium',
        }),
      });

      const response = await CreateSessionPOST(request);
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.discount).toBeDefined();
    });
  });

  describe('POST /api/checkout/confirm', () => {
    it('should confirm successful payment', async () => {
      const request = new Request('http://localhost:3000/api/checkout/confirm', {
        method: 'POST',
        body: JSON.stringify({
          sessionId: 'session-123',
        }),
      });

      const response = await ConfirmPOST(request);
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('orderId');
      expect(data).toHaveProperty('tickets');
    });

    it('should handle failed payment', async () => {
      const request = new Request('http://localhost:3000/api/checkout/confirm', {
        method: 'POST',
        body: JSON.stringify({
          sessionId: 'failed-session',
        }),
      });

      const response = await ConfirmPOST(request);
      expect(response.status).toBe(402);
    });

    it('should prevent double confirmation', async () => {
      const request = new Request('http://localhost:3000/api/checkout/confirm', {
        method: 'POST',
        body: JSON.stringify({
          sessionId: 'already-confirmed-session',
        }),
      });

      const response = await ConfirmPOST(request);
      expect(response.status).toBe(409);
    });
  });
});
