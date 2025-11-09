/**
 * Ticket Transfer System
 * Handles ticket ownership transfers between users with comprehensive validation
 */

import { createClient } from '@/lib/supabase/server';
import { sendTicketTransferEmail } from '@/lib/email/send';
import { ErrorResponses } from '@/lib/api/error-handler';

export interface TransferRequest {
  id: string;
  ticket_id: string;
  from_user_id: string;
  to_email: string;
  transfer_code: string;
  status: 'pending' | 'completed' | 'cancelled' | 'expired';
  created_at: string;
  expires_at: string;
}

/**
 * Generate unique transfer code
 */
function generateTransferCode(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  
  return `XFER-${timestamp}-${random}`.toUpperCase();
}

/**
 * Validate ticket transfer eligibility
 */
export async function validateTransferEligibility(
  ticketId: string,
  fromUserId: string
): Promise<{
  eligible: boolean;
  reason: string;
  ticket?: any;
  event?: any;
}> {
  const supabase = await createClient();

  // Get ticket with event details
  const { data: ticket, error: ticketError } = await supabase
    .from('tickets')
    .select(`
      *,
      ticket_types (
        event_id,
        transferable,
        transfer_fee,
        events (
          id,
          title,
          start_date,
          status,
          allow_transfers
        )
      )
    `)
    .eq('id', ticketId)
    .single();

  if (ticketError || !ticket) {
    return {
      eligible: false,
      reason: 'Ticket not found',
    };
  }

  // Check ownership
  if (ticket.user_id !== fromUserId) {
    return {
      eligible: false,
      reason: 'You do not own this ticket',
    };
  }

  // Check ticket status
  if (ticket.status !== 'active') {
    return {
      eligible: false,
      reason: `Ticket cannot be transferred (status: ${ticket.status})`,
    };
  }

  // Check if ticket has been scanned
  if (ticket.scanned_at) {
    return {
      eligible: false,
      reason: 'Ticket has already been scanned and cannot be transferred',
    };
  }

  // Check if there's already a pending transfer
  const { data: existingTransfer } = await supabase
    .from('ticket_transfers')
    .select('id')
    .eq('ticket_id', ticketId)
    .eq('status', 'pending')
    .single();

  if (existingTransfer) {
    return {
      eligible: false,
      reason: 'There is already a pending transfer for this ticket',
    };
  }

  const ticketTypeData = Array.isArray(ticket.ticket_types) 
    ? ticket.ticket_types[0] 
    : ticket.ticket_types;
  const eventData = ticketTypeData?.events;

  // Check if event allows transfers
  if (eventData && !eventData.allow_transfers) {
    return {
      eligible: false,
      reason: 'Transfers are not allowed for this event',
    };
  }

  // Check if ticket type is transferable
  if (ticketTypeData && ticketTypeData.transferable === false) {
    return {
      eligible: false,
      reason: 'This ticket type cannot be transferred',
    };
  }

  // Check event status
  if (eventData && eventData.status === 'cancelled') {
    return {
      eligible: false,
      reason: 'Event has been cancelled',
    };
  }

  // Check if event has already started
  if (eventData?.start_date) {
    const eventStart = new Date(eventData.start_date);
    const now = new Date();
    
    if (eventStart <= now) {
      return {
        eligible: false,
        reason: 'Event has already started',
      };
    }

    // Check transfer cutoff (24 hours before event)
    const hoursUntilEvent = (eventStart.getTime() - now.getTime()) / (1000 * 60 * 60);
    const TRANSFER_CUTOFF_HOURS = 24;
    
    if (hoursUntilEvent < TRANSFER_CUTOFF_HOURS) {
      return {
        eligible: false,
        reason: `Transfers must be completed at least ${TRANSFER_CUTOFF_HOURS} hours before the event`,
      };
    }
  }

  return {
    eligible: true,
    reason: 'Ticket is eligible for transfer',
    ticket,
    event: eventData,
  };
}

/**
 * Initiate ticket transfer with validation
 */
export async function initiateTicketTransfer(
  ticketId: string,
  fromUserId: string,
  toEmail: string,
  senderName: string,
  eventName: string
): Promise<{ transferCode: string; expiresAt: string }> {
  const supabase = await createClient();

  // Validate transfer eligibility
  const validation = await validateTransferEligibility(ticketId, fromUserId);
  
  if (!validation.eligible) {
    throw ErrorResponses.badRequest(validation.reason);
  }

  const ticket = validation.ticket;

  // Validate recipient email
  if (!toEmail || !toEmail.includes('@')) {
    throw ErrorResponses.badRequest('Invalid recipient email address');
  }

  // Check if transferring to self
  const { data: fromUser } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', fromUserId)
    .single();

  if (fromUser?.email?.toLowerCase() === toEmail.toLowerCase()) {
    throw ErrorResponses.badRequest('Cannot transfer ticket to yourself');
  }

  // Generate transfer code
  const transferCode = generateTransferCode();
  const EXPIRATION_HOURS = 72;
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + EXPIRATION_HOURS);

  // Create transfer request
  const { error: transferError } = await supabase
    .from('ticket_transfers')
    .insert({
      ticket_id: ticketId,
      from_user_id: fromUserId,
      to_email: toEmail,
      transfer_code: transferCode,
      status: 'pending',
      expires_at: expiresAt.toISOString(),
    });

  if (transferError) {
    throw new Error(`Failed to create transfer: ${transferError.message}`);
  }

  // Send transfer email
  await sendTicketTransferEmail({
    to: toEmail,
    recipientName: 'Ticket Recipient',
    senderName,
    eventName,
    ticketCount: 1,
    transferCode,
  });

  return {
    transferCode,
    expiresAt: expiresAt.toISOString(),
  };
}

/**
 * Accept ticket transfer with validation
 */
export async function acceptTicketTransfer(
  transferCode: string,
  recipientUserId: string,
  recipientName: string
): Promise<{ ticketId: string; success: boolean }> {
  const supabase = await createClient();

  // Validate transfer code format
  if (!transferCode || !transferCode.startsWith('XFER-')) {
    throw ErrorResponses.badRequest('Invalid transfer code format');
  }

  // Get transfer request with ticket details
  const { data: transfer, error: transferError } = await supabase
    .from('ticket_transfers')
    .select(`
      *,
      tickets (
        *,
        ticket_types (
          event_id,
          events (
            id,
            title,
            start_date,
            status
          )
        )
      )
    `)
    .eq('transfer_code', transferCode)
    .eq('status', 'pending')
    .single();

  if (transferError || !transfer) {
    throw ErrorResponses.notFound('Transfer request not found or already processed');
  }

  // Check if expired
  if (new Date(transfer.expires_at) < new Date()) {
    await supabase
      .from('ticket_transfers')
      .update({ status: 'expired' })
      .eq('id', transfer.id);
    
    throw ErrorResponses.badRequest('Transfer request has expired');
  }

  // Verify recipient email matches
  const { data: recipientProfile } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', recipientUserId)
    .single();

  if (recipientProfile?.email?.toLowerCase() !== transfer.to_email.toLowerCase()) {
    throw ErrorResponses.forbidden('This transfer is not intended for your email address');
  }

  // Validate ticket is still transferable
  const ticketData = Array.isArray(transfer.tickets) ? transfer.tickets[0] : transfer.tickets;
  
  if (ticketData.status !== 'active') {
    throw ErrorResponses.badRequest(`Ticket cannot be transferred (status: ${ticketData.status})`);
  }

  if (ticketData.scanned_at) {
    throw ErrorResponses.badRequest('Ticket has been scanned and cannot be transferred');
  }

  // Check event hasn't started
  const ticketTypeData = Array.isArray(ticketData.ticket_types) 
    ? ticketData.ticket_types[0] 
    : ticketData.ticket_types;
  const eventData = ticketTypeData?.events;

  if (eventData?.start_date && new Date(eventData.start_date) <= new Date()) {
    throw ErrorResponses.badRequest('Event has already started');
  }

  if (eventData?.status === 'cancelled') {
    throw ErrorResponses.badRequest('Event has been cancelled');
  }

  // Update ticket ownership
  const { error: ticketError } = await supabase
    .from('tickets')
    .update({
      user_id: recipientUserId,
      attendee_name: recipientName,
      transferred_at: new Date().toISOString(),
    })
    .eq('id', transfer.ticket_id);

  if (ticketError) {
    throw new Error(`Failed to transfer ticket: ${ticketError.message}`);
  }

  // Mark transfer as completed
  const { error: updateError } = await supabase
    .from('ticket_transfers')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      to_user_id: recipientUserId,
    })
    .eq('id', transfer.id);

  if (updateError) {
    throw new Error(`Failed to update transfer status: ${updateError.message}`);
  }

  return {
    ticketId: transfer.ticket_id,
    success: true,
  };
}

/**
 * Cancel ticket transfer
 */
export async function cancelTicketTransfer(
  transferCode: string,
  userId: string
): Promise<void> {
  const supabase = await createClient();

  // Get transfer request
  const { data: transfer, error: transferError } = await supabase
    .from('ticket_transfers')
    .select('*')
    .eq('transfer_code', transferCode)
    .single();

  if (transferError || !transfer) {
    throw new Error('Transfer request not found');
  }

  // Verify ownership
  if (transfer.from_user_id !== userId) {
    throw new Error('You can only cancel your own transfers');
  }

  // Check if already completed
  if (transfer.status === 'completed') {
    throw new Error('Transfer has already been completed');
  }

  // Cancel transfer
  const { error: updateError } = await supabase
    .from('ticket_transfers')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
    })
    .eq('id', transfer.id);

  if (updateError) {
    throw new Error(`Failed to cancel transfer: ${updateError.message}`);
  }
}

/**
 * Get transfer request details
 */
export async function getTransferDetails(
  transferCode: string
): Promise<TransferRequest | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('ticket_transfers')
    .select('*')
    .eq('transfer_code', transferCode)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

/**
 * Get user's pending transfers (sent)
 */
export async function getUserPendingTransfers(
  userId: string
): Promise<TransferRequest[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('ticket_transfers')
    .select('*')
    .eq('from_user_id', userId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to get transfers: ${error.message}`);
  }

  return data || [];
}

/**
 * Get user's received transfers
 */
export async function getUserReceivedTransfers(
  email: string
): Promise<TransferRequest[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('ticket_transfers')
    .select('*')
    .eq('to_email', email)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to get received transfers: ${error.message}`);
  }

  return data || [];
}

/**
 * Expire old transfer requests (cron job)
 */
export async function expireOldTransfers(): Promise<number> {
  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data: expiredTransfers, error: fetchError } = await supabase
    .from('ticket_transfers')
    .select('id')
    .eq('status', 'pending')
    .lt('expires_at', now);

  if (fetchError) {
    throw new Error(`Failed to fetch expired transfers: ${fetchError.message}`);
  }

  if (!expiredTransfers || expiredTransfers.length === 0) {
    return 0;
  }

  const transferIds = expiredTransfers.map(t => t.id);

  const { error: updateError } = await supabase
    .from('ticket_transfers')
    .update({ status: 'expired' })
    .in('id', transferIds);

  if (updateError) {
    throw new Error(`Failed to expire transfers: ${updateError.message}`);
  }

  return expiredTransfers.length;
}

/**
 * Batch transfer multiple tickets
 */
export async function batchTransferTickets(
  ticketIds: string[],
  fromUserId: string,
  toEmail: string,
  senderName: string,
  eventName: string
): Promise<Array<{ ticketId: string; transferCode: string; success: boolean }>> {
  const results = [];

  for (const ticketId of ticketIds) {
    try {
      const { transferCode } = await initiateTicketTransfer(
        ticketId,
        fromUserId,
        toEmail,
        senderName,
        eventName
      );

      results.push({
        ticketId,
        transferCode,
        success: true,
      });
    } catch (error) {
      results.push({
        ticketId,
        transferCode: '',
        success: false,
      });
    }
  }

  return results;
}
