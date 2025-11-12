/**
 * QR Code System Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateTicketCode, validateTicketQRCode, markTicketAsScanned } from '../qr-codes';

// Create persistent query builder
const mockQueryBuilder = {
  select: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  single: vi.fn(),
};

const mockSupabase = {
  from: vi.fn(() => mockQueryBuilder),
};

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => mockSupabase),
}));

describe('QR Code System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateTicketCode', () => {
    it('should generate valid ticket code format', () => {
      const code = generateTicketCode('ticket-12345678', 'event-87654321');

      expect(code).toMatch(/^TKT-[A-Z0-9-]+-[A-Z0-9-]+-[A-Z0-9]+-[A-Z0-9]+$/);
      expect(code).toContain('TKT-');
    });

    it('should generate unique codes', () => {
      const code1 = generateTicketCode('ticket-123', 'event-456');
      const code2 = generateTicketCode('ticket-123', 'event-456');

      expect(code1).not.toBe(code2);
    });
  });

  describe('validateTicketQRCode', () => {
    it('should validate active ticket', async () => {
      const mockTicket = {
        id: 'ticket-123',
        event_id: 'event-456',
        status: 'active',
        attendee_name: 'John Doe',
        qr_code: 'TKT-EVENT456-TICKET12-ABC123-XYZ789',
      };

      mockQueryBuilder.single.mockResolvedValueOnce({ data: mockTicket, error: null });

      const result = await validateTicketQRCode('TKT-EVENT456-TICKET12-ABC123-XYZ789');

      expect(result.valid).toBe(true);
      expect(result.ticket).toBeDefined();
      expect(result.ticket?.id).toBe('ticket-123');
    });

    it('should reject invalid code format', async () => {
      const result = await validateTicketQRCode('INVALID-CODE');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid ticket code format');
    });

    it('should reject used ticket', async () => {
      const mockTicket = {
        id: 'ticket-123',
        event_id: 'event-456',
        status: 'used',
        attendee_name: 'John Doe',
        qr_code: 'TKT-EVENT456-TICKET12-ABC123-XYZ789',
      };

      mockQueryBuilder.single.mockResolvedValueOnce({ data: mockTicket, error: null });

      const result = await validateTicketQRCode('TKT-EVENT456-TICKET12-ABC123-XYZ789');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Ticket already scanned');
    });

    it('should reject cancelled ticket', async () => {
      const mockTicket = {
        id: 'ticket-123',
        event_id: 'event-456',
        status: 'cancelled',
        attendee_name: 'John Doe',
        qr_code: 'TKT-EVENT456-TICKET12-ABC123-XYZ789',
      };

      mockQueryBuilder.single.mockResolvedValueOnce({ data: mockTicket, error: null });

      const result = await validateTicketQRCode('TKT-EVENT456-TICKET12-ABC123-XYZ789');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Ticket has been cancelled');
    });

    it('should reject non-existent ticket', async () => {
      mockQueryBuilder.single.mockResolvedValueOnce({ 
        data: null, 
        error: { message: 'Not found' } 
      });

      const result = await validateTicketQRCode('TKT-EVENT456-TICKET12-ABC123-XYZ789');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Ticket not found');
    });
  });

  describe('markTicketAsScanned', () => {
    it('should mark ticket as scanned', async () => {
      mockQueryBuilder.update.mockResolvedValueOnce({ error: null });

      await expect(
        markTicketAsScanned('ticket-123', 'scanner-456')
      ).resolves.not.toThrow();

      expect(mockSupabase.from).toHaveBeenCalledWith('tickets');
    });

    it('should throw error on database failure', async () => {
      mockQueryBuilder.update.mockResolvedValueOnce({ 
        error: { message: 'Database error' } 
      });

      await expect(
        markTicketAsScanned('ticket-123', 'scanner-456')
      ).rejects.toThrow('Failed to mark ticket as scanned');
    });
  });
});
