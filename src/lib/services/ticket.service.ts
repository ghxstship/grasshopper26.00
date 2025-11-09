import { createClient } from '@/lib/supabase/server';
import QRCode from 'qrcode';
import { Database } from '@/types/database';

type Ticket = Database['public']['Tables']['tickets']['Row'];
type TicketInsert = Database['public']['Tables']['tickets']['Insert'];

export class TicketService {
  private supabase: Awaited<ReturnType<typeof createClient>>;

  constructor(supabase: Awaited<ReturnType<typeof createClient>>) {
    this.supabase = supabase;
  }

  async generateQRCode(ticketId: string): Promise<string> {
    try {
      const qrData = `${process.env.NEXT_PUBLIC_APP_URL}/tickets/validate/${ticketId}`;
      const qrCode = await QRCode.toDataURL(qrData, {
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
      return qrCode;
    } catch (error) {
      console.error('QR code generation error:', error);
      throw new Error('Failed to generate QR code');
    }
  }

  async createTickets(
    orderId: string,
    ticketTypeId: string,
    quantity: number,
    attendeeInfo?: Array<{ name: string; email: string }>
  ): Promise<Ticket[]> {
    const tickets: TicketInsert[] = [];

    for (let i = 0; i < quantity; i++) {
      const ticketId = crypto.randomUUID();
      const qrCode = await this.generateQRCode(ticketId);

      tickets.push({
        id: ticketId,
        order_id: orderId,
        ticket_type_id: ticketTypeId,
        qr_code: qrCode,
        status: 'pending',
        attendee_name: attendeeInfo?.[i]?.name,
        attendee_email: attendeeInfo?.[i]?.email,
      } as TicketInsert);
    }

    const { data, error } = await this.supabase
      .from('tickets')
      .insert(tickets)
      .select();

    if (error) {
      throw new Error(`Failed to create tickets: ${error.message}`);
    }

    return data || [];
  }

  async activateTickets(orderId: string): Promise<void> {
    const { error } = await this.supabase
      .from('tickets')
      .update({ status: 'active' })
      .eq('order_id', orderId);

    if (error) {
      throw new Error(`Failed to activate tickets: ${error.message}`);
    }
  }

  async getTicketsByOrder(orderId: string): Promise<Ticket[]> {
    const { data, error } = await this.supabase
      .from('tickets')
      .select('*')
      .eq('order_id', orderId);

    if (error) {
      throw new Error(`Failed to fetch tickets: ${error.message}`);
    }

    return data || [];
  }

  async validateTicket(ticketId: string): Promise<{ valid: boolean; ticket?: Ticket }> {
    const { data: ticket, error } = await this.supabase
      .from('tickets')
      .select('*')
      .eq('id', ticketId)
      .single();

    if (error || !ticket) {
      return { valid: false };
    }

    if (ticket.status !== 'active') {
      return { valid: false, ticket };
    }

    return { valid: true, ticket };
  }

  async scanTicket(ticketId: string): Promise<Ticket> {
    const { data: ticket, error: fetchError } = await this.supabase
      .from('tickets')
      .select('*')
      .eq('id', ticketId)
      .single();

    if (fetchError || !ticket) {
      throw new Error('Ticket not found');
    }

    if (ticket.status === 'used') {
      throw new Error('Ticket already used');
    }

    if (ticket.status !== 'active') {
      throw new Error('Ticket is not active');
    }

    const { data: updatedTicket, error: updateError } = await this.supabase
      .from('tickets')
      .update({ 
        status: 'used',
        scanned_at: new Date().toISOString(),
      })
      .eq('id', ticketId)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Failed to scan ticket: ${updateError.message}`);
    }

    return updatedTicket;
  }

  async transferTicket(
    ticketId: string,
    fromUserId: string,
    toUserId: string
  ): Promise<Ticket> {
    const { data: ticket, error: fetchError } = await this.supabase
      .from('tickets')
      .select('*, orders!inner(user_id)')
      .eq('id', ticketId)
      .single();

    if (fetchError || !ticket) {
      throw new Error('Ticket not found');
    }

    if (ticket.orders.user_id !== fromUserId) {
      throw new Error('Unauthorized');
    }

    if (ticket.status === 'used') {
      throw new Error('Cannot transfer used ticket');
    }

    const { data: updatedTicket, error: updateError } = await this.supabase
      .from('tickets')
      .update({ transferred_to_user_id: toUserId })
      .eq('id', ticketId)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Failed to transfer ticket: ${updateError.message}`);
    }

    return updatedTicket;
  }
}
