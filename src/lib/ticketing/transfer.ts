/**
 * Ticket Transfer System
 * Handles ticket ownership transfers between users
 */

import { createClient } from '@/lib/supabase/server';
import { sendTicketTransferEmail } from '@/lib/email/send';

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
 * Initiate ticket transfer
 */
export async function initiateTicketTransfer(
  ticketId: string,
  fromUserId: string,
  toEmail: string,
  senderName: string,
  eventName: string
): Promise<{ transferCode: string; expiresAt: string }> {
  const supabase = await createClient();

  // Verify ticket ownership
  const { data: ticket, error: ticketError } = await supabase
    .from('tickets')
    .select('id, user_id, status, attendee_name')
    .eq('id', ticketId)
    .single();

  if (ticketError || !ticket) {
    throw new Error('Ticket not found');
  }

  if (ticket.user_id !== fromUserId) {
    throw new Error('You do not own this ticket');
  }

  if (ticket.status !== 'active') {
    throw new Error('Ticket cannot be transferred');
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
 * Accept ticket transfer
 */
export async function acceptTicketTransfer(
  transferCode: string,
  recipientUserId: string,
  recipientName: string
): Promise<{ ticketId: string; success: boolean }> {
  const supabase = await createClient();

  // Get transfer request
  const { data: transfer, error: transferError } = await supabase
    .from('ticket_transfers')
    .select('*, tickets(*)')
    .eq('transfer_code', transferCode)
    .eq('status', 'pending')
    .single();

  if (transferError || !transfer) {
    throw new Error('Transfer request not found or expired');
  }

  // Check if expired
  if (new Date(transfer.expires_at) < new Date()) {
    await supabase
      .from('ticket_transfers')
      .update({ status: 'expired' })
      .eq('id', transfer.id);
    
    throw new Error('Transfer request has expired');
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
