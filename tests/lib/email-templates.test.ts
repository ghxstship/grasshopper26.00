/**
 * Email Templates Tests
 * Tests email template generation and formatting
 */

import { describe, it, expect } from 'vitest';
import {
  generateOrderConfirmationEmail,
  generatePasswordResetEmail,
  generateEmailVerificationEmail,
  generateTicketEmail,
} from '@/lib/email/templates';

describe('Email Templates', () => {
  describe('generateOrderConfirmationEmail', () => {
    it('should generate order confirmation email', () => {
      const order = {
        id: 'order-123',
        total: 15000,
        items: [
          { name: 'VIP Ticket', quantity: 2, price: 7500 },
        ],
        user: {
          name: 'John Doe',
          email: 'john@example.com',
        },
      };

      const email = generateOrderConfirmationEmail(order);

      expect(email.subject).toContain('Order Confirmation');
      expect(email.html).toContain('order-123');
      expect(email.html).toContain('John Doe');
      expect(email.html).toContain('$150.00');
    });

    it('should include all order items', () => {
      const order = {
        id: 'order-456',
        total: 20000,
        items: [
          { name: 'General Admission', quantity: 1, price: 5000 },
          { name: 'VIP Ticket', quantity: 1, price: 15000 },
        ],
        user: {
          name: 'Jane Smith',
          email: 'jane@example.com',
        },
      };

      const email = generateOrderConfirmationEmail(order);

      expect(email.html).toContain('General Admission');
      expect(email.html).toContain('VIP Ticket');
    });
  });

  describe('generatePasswordResetEmail', () => {
    it('should generate password reset email', () => {
      const data = {
        name: 'John Doe',
        resetLink: 'https://gvteway.com/reset-password?token=abc123',
      };

      const email = generatePasswordResetEmail(data);

      expect(email.subject).toContain('Password Reset');
      expect(email.html).toContain('John Doe');
      expect(email.html).toContain(data.resetLink);
    });

    it('should include security warning', () => {
      const data = {
        name: 'Jane Smith',
        resetLink: 'https://gvteway.com/reset-password?token=xyz789',
      };

      const email = generatePasswordResetEmail(data);

      expect(email.html).toContain('did not request');
      expect(email.html).toContain('ignore');
    });
  });

  describe('generateEmailVerificationEmail', () => {
    it('should generate email verification email', () => {
      const data = {
        name: 'John Doe',
        verificationLink: 'https://gvteway.com/verify?token=verify123',
      };

      const email = generateEmailVerificationEmail(data);

      expect(email.subject).toContain('Verify');
      expect(email.html).toContain('John Doe');
      expect(email.html).toContain(data.verificationLink);
    });

    it('should include welcome message', () => {
      const data = {
        name: 'Jane Smith',
        verificationLink: 'https://gvteway.com/verify?token=verify456',
      };

      const email = generateEmailVerificationEmail(data);

      expect(email.html).toContain('Welcome');
      expect(email.html).toContain('GVTEWAY');
    });
  });

  describe('generateTicketEmail', () => {
    it('should generate ticket email with QR code', () => {
      const ticket = {
        id: 'ticket-123',
        eventName: 'Summer Music Festival',
        eventDate: new Date('2025-07-15T19:00:00'),
        venue: 'Central Park',
        qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANS...',
        user: {
          name: 'John Doe',
          email: 'john@example.com',
        },
      };

      const email = generateTicketEmail(ticket);

      expect(email.subject).toContain('Ticket');
      expect(email.subject).toContain('Summer Music Festival');
      expect(email.html).toContain('ticket-123');
      expect(email.html).toContain('Central Park');
      expect(email.html).toContain(ticket.qrCode);
    });

    it('should format event date correctly', () => {
      const ticket = {
        id: 'ticket-456',
        eventName: 'Jazz Night',
        eventDate: new Date('2025-08-20T20:30:00'),
        venue: 'Blue Note',
        qrCode: 'data:image/png;base64,abc123',
        user: {
          name: 'Jane Smith',
          email: 'jane@example.com',
        },
      };

      const email = generateTicketEmail(ticket);

      expect(email.html).toMatch(/August|Aug/);
      expect(email.html).toContain('20');
      expect(email.html).toContain('2025');
    });
  });

  describe('Email formatting', () => {
    it('should include GVTEWAY branding', () => {
      const order = {
        id: 'order-123',
        total: 10000,
        items: [],
        user: { name: 'Test', email: 'test@example.com' },
      };

      const email = generateOrderConfirmationEmail(order);

      expect(email.html).toContain('GVTEWAY');
    });

    it('should include support email', () => {
      const data = {
        name: 'Test User',
        resetLink: 'https://gvteway.com/reset',
      };

      const email = generatePasswordResetEmail(data);

      expect(email.html).toContain('support@gvteway.com');
    });

    it('should be mobile-responsive', () => {
      const order = {
        id: 'order-123',
        total: 10000,
        items: [],
        user: { name: 'Test', email: 'test@example.com' },
      };

      const email = generateOrderConfirmationEmail(order);

      expect(email.html).toContain('max-width');
      expect(email.html).toContain('responsive');
    });
  });
});
