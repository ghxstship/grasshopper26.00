/**
 * QR Code Generation System for Tickets
 * Generates unique, secure QR codes for ticket validation
 */

import QRCode from 'qrcode';
import { createClient } from '@/lib/supabase/server';

export interface QRCodeOptions {
  size?: number;
  margin?: number;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  color?: {
    dark?: string;
    light?: string;
  };
}

/**
 * Generate unique ticket code
 */
export function generateTicketCode(ticketId: string, eventId: string): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  
  return `TKT-${eventId.substring(0, 8)}-${ticketId.substring(0, 8)}-${timestamp}-${random}`.toUpperCase();
}

/**
 * Generate QR code data URL
 */
export async function generateQRCode(
  data: string,
  options: QRCodeOptions = {}
): Promise<string> {
  const defaultOptions: QRCode.QRCodeToDataURLOptions = {
    width: options.size || 400,
    margin: options.margin || 2,
    errorCorrectionLevel: options.errorCorrectionLevel || 'H',
    color: {
      dark: options.color?.dark || '#000000',
      light: options.color?.light || '#FFFFFF',
    },
  };

  try {
    return await QRCode.toDataURL(data, defaultOptions);
  } catch (error) {
    throw new Error(`Failed to generate QR code: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate QR code as SVG string
 */
export async function generateQRCodeSVG(
  data: string,
  options: QRCodeOptions = {}
): Promise<string> {
  const defaultOptions: QRCode.QRCodeToStringOptions = {
    type: 'svg',
    width: options.size || 400,
    margin: options.margin || 2,
    errorCorrectionLevel: options.errorCorrectionLevel || 'H',
    color: {
      dark: options.color?.dark || '#000000',
      light: options.color?.light || '#FFFFFF',
    },
  };

  try {
    return await QRCode.toString(data, defaultOptions);
  } catch (error) {
    throw new Error(`Failed to generate QR code SVG: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate QR code for ticket
 */
export async function generateTicketQRCode(
  ticketId: string,
  eventId: string,
  options: QRCodeOptions = {}
): Promise<{ code: string; qrDataUrl: string; qrSvg: string }> {
  const code = generateTicketCode(ticketId, eventId);
  
  // Generate both data URL and SVG
  const [qrDataUrl, qrSvg] = await Promise.all([
    generateQRCode(code, options),
    generateQRCodeSVG(code, options),
  ]);

  return {
    code,
    qrDataUrl,
    qrSvg,
  };
}

/**
 * Validate ticket QR code
 */
export async function validateTicketQRCode(
  code: string
): Promise<{
  valid: boolean;
  ticket?: {
    id: string;
    event_id: string;
    status: string;
    attendee_name: string;
  };
  error?: string;
}> {
  const supabase = await createClient();

  // Parse code format: TKT-{eventId}-{ticketId}-{timestamp}-{random}
  const parts = code.split('-');
  if (parts.length !== 5 || parts[0] !== 'TKT') {
    return {
      valid: false,
      error: 'Invalid ticket code format',
    };
  }

  // Query ticket by QR code
  const { data: ticket, error } = await supabase
    .from('tickets')
    .select('id, event_id, status, attendee_name, qr_code')
    .eq('qr_code', code)
    .single();

  if (error || !ticket) {
    return {
      valid: false,
      error: 'Ticket not found',
    };
  }

  // Check if ticket is already used
  if (ticket.status === 'used') {
    return {
      valid: false,
      ticket,
      error: 'Ticket already scanned',
    };
  }

  // Check if ticket is cancelled
  if (ticket.status === 'cancelled') {
    return {
      valid: false,
      ticket,
      error: 'Ticket has been cancelled',
    };
  }

  return {
    valid: true,
    ticket,
  };
}

/**
 * Mark ticket as scanned
 */
export async function markTicketAsScanned(
  ticketId: string,
  scannedBy?: string
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('tickets')
    .update({
      status: 'used',
      scanned_at: new Date().toISOString(),
      scanned_by: scannedBy,
    })
    .eq('id', ticketId);

  if (error) {
    throw new Error(`Failed to mark ticket as scanned: ${error.message}`);
  }
}

/**
 * Batch generate QR codes for multiple tickets
 */
export async function batchGenerateQRCodes(
  tickets: Array<{ id: string; event_id: string }>,
  options: QRCodeOptions = {}
): Promise<Array<{ ticketId: string; code: string; qrDataUrl: string }>> {
  const results = await Promise.all(
    tickets.map(async (ticket) => {
      const { code, qrDataUrl } = await generateTicketQRCode(
        ticket.id,
        ticket.event_id,
        options
      );
      
      return {
        ticketId: ticket.id,
        code,
        qrDataUrl,
      };
    })
  );

  return results;
}

/**
 * Update ticket with QR code in database
 */
export async function updateTicketQRCode(
  ticketId: string,
  eventId: string
): Promise<string> {
  const supabase = await createClient();

  const { code, qrDataUrl } = await generateTicketQRCode(ticketId, eventId);

  const { error } = await supabase
    .from('tickets')
    .update({
      qr_code: code,
      qr_code_url: qrDataUrl,
    })
    .eq('id', ticketId);

  if (error) {
    throw new Error(`Failed to update ticket QR code: ${error.message}`);
  }

  return qrDataUrl;
}

/**
 * Get ticket scan statistics
 */
export async function getTicketScanStats(eventId: string): Promise<{
  total: number;
  scanned: number;
  pending: number;
  cancelled: number;
  scanRate: number;
}> {
  const supabase = await createClient();

  const { data: tickets, error } = await supabase
    .from('tickets')
    .select('status')
    .eq('event_id', eventId);

  if (error) {
    throw new Error(`Failed to get ticket stats: ${error.message}`);
  }

  const total = tickets?.length || 0;
  const scanned = tickets?.filter(t => t.status === 'used').length || 0;
  const pending = tickets?.filter(t => t.status === 'active').length || 0;
  const cancelled = tickets?.filter(t => t.status === 'cancelled').length || 0;
  const scanRate = total > 0 ? (scanned / total) * 100 : 0;

  return {
    total,
    scanned,
    pending,
    cancelled,
    scanRate: Math.round(scanRate * 10) / 10,
  };
}
