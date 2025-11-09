/**
 * Admin Resend Tickets Page
 * Resend ticket confirmation emails to customers
 */

'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/design-system/components/atoms/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/components/atoms/card';
import { Badge } from '@/design-system/components/atoms/badge';
import { 
  ArrowLeft, 
  Mail, 
  Loader2,
  CheckCircle,
  AlertCircle,
  Ticket
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function ResendTicketsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTickets, setSelectedTickets] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function fetchOrder() {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/orders/${id}`);
      const data = await response.json();
      
      if (data.order) {
        setOrder(data.order);
        setTickets(data.order.tickets || []);
        // Select all tickets by default
        setSelectedTickets(new Set((data.order.tickets || []).map((t: any) => t.id)));
      }
    } catch (error) {
      console.error('Failed to fetch order:', error);
      toast.error('Failed to load order');
    } finally {
      setLoading(false);
    }
  }

  function toggleTicket(ticketId: string) {
    const newSelected = new Set(selectedTickets);
    if (newSelected.has(ticketId)) {
      newSelected.delete(ticketId);
    } else {
      newSelected.add(ticketId);
    }
    setSelectedTickets(newSelected);
  }

  function toggleAll() {
    if (selectedTickets.size === tickets.length) {
      setSelectedTickets(new Set());
    } else {
      setSelectedTickets(new Set(tickets.map(t => t.id)));
    }
  }

  async function handleResend() {
    if (selectedTickets.size === 0) {
      toast.error('Please select at least one ticket to resend');
      return;
    }

    if (!confirm(`Are you sure you want to resend ${selectedTickets.size} ticket(s)?`)) {
      return;
    }

    setSending(true);
    try {
      const response = await fetch(`/api/admin/orders/${id}/resend-tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticket_ids: Array.from(selectedTickets),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Successfully resent ${selectedTickets.size} ticket(s)`);
        router.push(`/admin/orders/${id}`);
      } else {
        toast.error(data.error || 'Failed to resend tickets');
      }
    } catch (error) {
      console.error('Error resending tickets:', error);
      toast.error('Failed to resend tickets');
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-black" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="font-share text-body">Order not found</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <section className="border-b-3 border-black py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <Link
            href={`/admin/orders/${id}`}
            className="inline-flex items-center gap-2 font-bebas text-body uppercase mb-6 hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Order
          </Link>
          <h1 className="font-anton text-hero uppercase mb-2">
            Resend Tickets
          </h1>
          <p className="font-share text-body text-grey-700">
            Order #{order.id.slice(0, 8).toUpperCase()} - Resend ticket confirmation emails
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Order Info */}
          <Card className="border-3 border-black shadow-geometric mb-6">
            <CardHeader className="border-b-3 border-black">
              <CardTitle className="font-bebas text-h3 uppercase">Order Information</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <p className="font-bebas uppercase text-small text-grey-600 mb-1">Customer Email</p>
                  <p className="font-share text-body">{order.user_email || 'N/A'}</p>
                </div>
                <div>
                  <p className="font-bebas uppercase text-small text-grey-600 mb-1">Event</p>
                  <p className="font-share text-body">{order.events?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="font-bebas uppercase text-small text-grey-600 mb-1">Order Date</p>
                  <p className="font-share text-body">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Warning Card */}
          <Card className="border-3 border-yellow-500 bg-yellow-50 shadow-geometric mb-6">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <AlertCircle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bebas text-h4 uppercase mb-2">Important Notice</h3>
                  <p className="font-share text-body text-grey-700">
                    This will resend the ticket confirmation email to the customer. 
                    Make sure the customer&apos;s email address is correct before proceeding.
                    The customer will receive a new email with their ticket(s) and QR code(s).
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tickets Selection */}
          <Card className="border-3 border-black shadow-geometric">
            <CardHeader className="border-b-3 border-black">
              <div className="flex items-center justify-between">
                <CardTitle className="font-bebas text-h3 uppercase flex items-center gap-2">
                  <Ticket className="h-5 w-5" />
                  Select Tickets to Resend
                </CardTitle>
                <Button
                  onClick={toggleAll}
                  variant="outline"
                  className="border-3 border-black font-bebas uppercase"
                >
                  {selectedTickets.size === tickets.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {tickets.length === 0 ? (
                <p className="text-center py-8 text-grey-600 font-share">
                  No tickets found for this order
                </p>
              ) : (
                <div className="space-y-3">
                  {tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      onClick={() => toggleTicket(ticket.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          toggleTicket(ticket.id);
                        }
                      }}
                      role="checkbox"
                      aria-checked={selectedTickets.has(ticket.id)}
                      tabIndex={0}
                      className={`
                        border-3 border-black p-4 cursor-pointer transition-colors
                        ${selectedTickets.has(ticket.id) 
                          ? 'bg-green-50 hover:bg-green-100' 
                          : 'bg-white hover:bg-grey-50'
                        }
                      `}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="mt-1">
                            {selectedTickets.has(ticket.id) ? (
                              <CheckCircle className="h-6 w-6 text-green-600" />
                            ) : (
                              <div className="h-6 w-6 border-3 border-black rounded-full" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bebas text-h4 uppercase mb-1">
                              {ticket.ticket_types?.name || 'Ticket'}
                            </h4>
                            <div className="space-y-1">
                              <p className="font-share text-small text-grey-600">
                                Ticket ID: {ticket.id.slice(0, 8).toUpperCase()}
                              </p>
                              <p className="font-share text-small text-grey-600">
                                QR Code: {ticket.qr_code || 'Generated'}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge className={
                                  ticket.status === 'valid' 
                                    ? 'bg-green-500 text-white border-3 border-black'
                                    : ticket.status === 'used'
                                    ? 'bg-grey-500 text-white border-3 border-black'
                                    : 'bg-red-500 text-white border-3 border-black'
                                }>
                                  {ticket.status}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-8">
            <Button
              onClick={handleResend}
              disabled={sending || selectedTickets.size === 0}
              className="flex-1 h-14 bg-black text-white hover:bg-white hover:text-black border-3 border-black font-bebas text-body uppercase"
            >
              {sending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Resend {selectedTickets.size} Ticket{selectedTickets.size !== 1 ? 's' : ''}
                </>
              )}
            </Button>
            <Button
              onClick={() => router.push(`/admin/orders/${id}`)}
              className="h-14 bg-white text-black hover:bg-black hover:text-white border-3 border-black font-bebas text-body uppercase px-8"
            >
              Cancel
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
