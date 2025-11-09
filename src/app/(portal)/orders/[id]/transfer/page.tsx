'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/components/atoms/card';
import { Button } from '@/design-system/components/atoms/button';
import { Input } from '@/design-system/components/atoms/input';
import { Loader2, ArrowLeft, Send, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface Ticket {
  id: string;
  qr_code: string;
  status: string;
  ticket_type_id: string;
  ticket_type: {
    name: string;
    price: string;
    event: {
      id: string;
      name: string;
      start_date: string;
      venue_name: string;
    };
  };
}

interface Order {
  id: string;
  tickets: Ticket[];
  user_id: string;
}

export default function TransferTicketsPage() {
  const router = useRouter();
  const params = useParams();
  const supabase = createClient();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [transferring, setTransferring] = useState(false);
  const [selectedTickets, setSelectedTickets] = useState<Set<string>>(new Set());
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');

  useEffect(() => {
    loadOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadOrder = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login?redirect=/orders');
        return;
      }

      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          user_id,
          tickets (
            id,
            qr_code,
            status,
            ticket_type_id,
            ticket_type:ticket_types (
              name,
              price,
              event:events (
                id,
                name,
                start_date,
                venue_name
              )
            )
          )
        `)
        .eq('id', params.id)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      // Filter only active tickets that can be transferred
      const transferableTickets = (data.tickets || []).filter(
        (t: any) => t.status === 'active'
      );

      setOrder({
        ...data,
        tickets: transferableTickets,
      } as any);
    } catch (error) {
      console.error('Error loading order:', error);
      toast.error('Failed to load order');
      router.push('/orders');
    } finally {
      setLoading(false);
    }
  };

  const toggleTicketSelection = (ticketId: string) => {
    setSelectedTickets(prev => {
      const next = new Set(prev);
      if (next.has(ticketId)) {
        next.delete(ticketId);
      } else {
        next.add(ticketId);
      }
      return next;
    });
  };

  const validateTransfer = (): string | null => {
    if (selectedTickets.size === 0) {
      return 'Please select at least one ticket to transfer';
    }

    if (!recipientEmail || !recipientEmail.includes('@')) {
      return 'Please enter a valid recipient email address';
    }

    if (!recipientName || recipientName.trim().length < 2) {
      return 'Please enter the recipient\'s name';
    }

    // Check if event is within 24 hours
    const selectedTicketsList = order?.tickets.filter(t => selectedTickets.has(t.id)) || [];
    for (const ticket of selectedTicketsList) {
      const eventDate = new Date(ticket.ticket_type.event.start_date);
      const now = new Date();
      const hoursUntilEvent = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      if (hoursUntilEvent < 24) {
        return 'Cannot transfer tickets within 24 hours of the event';
      }
    }

    return null;
  };

  const handleTransfer = async () => {
    const validationError = validateTransfer();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setTransferring(true);
    try {
      const ticketIds = Array.from(selectedTickets);

      // Call the transfer API for each ticket
      const transferPromises = ticketIds.map(ticketId =>
        fetch(`/api/v1/tickets/${ticketId}/transfer`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            recipient_email: recipientEmail,
            recipient_name: recipientName,
          }),
        })
      );

      const results = await Promise.all(transferPromises);
      const failedTransfers = results.filter(r => !r.ok);

      if (failedTransfers.length > 0) {
        throw new Error(`Failed to transfer ${failedTransfers.length} ticket(s)`);
      }

      toast.success(`Successfully transferred ${ticketIds.length} ticket(s)`);
      router.push(`/orders/${params.id}`);
    } catch (error) {
      console.error('Error transferring tickets:', error);
      toast.error('Failed to transfer tickets. Please try again.');
    } finally {
      setTransferring(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center " style={{ background: 'var(--gradient-hero)' }}>
        <Loader2 className="h-12 w-12 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!order || order.tickets.length === 0) {
    return (
      <div className="min-h-screen  py-12 px-4" style={{ background: 'var(--gradient-hero)' }}>
        <div className="max-w-4xl mx-auto">
          <Card className="bg-black/40 backdrop-blur-lg border-purple-500/20">
            <CardContent className="py-12 text-center">
              <AlertCircle className="h-16 w-16 mx-auto text-yellow-500 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Transferable Tickets</h3>
              <p className="text-gray-400 mb-6">
                This order has no tickets available for transfer.
              </p>
              <Button asChild className="" style={{ background: 'var(--gradient-brand-primary)' }}>
                <Link href="/orders">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Orders
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const event = order.tickets[0]?.ticket_type?.event;

  return (
    <div className="min-h-screen  py-12 px-4" style={{ background: 'var(--gradient-hero)' }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            asChild
            variant="ghost"
            className="mb-4 text-gray-400 hover:text-white"
          >
            <Link href={`/orders/${params.id}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Order
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-white mb-2">Transfer Tickets</h1>
          <p className="text-gray-400">
            Transfer tickets to another person via email
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Ticket Selection */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="bg-black/40 backdrop-blur-lg border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white">Select Tickets to Transfer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {order.tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    role="checkbox"
                    aria-checked={selectedTickets.has(ticket.id)}
                    tabIndex={0}
                    onClick={() => toggleTicketSelection(ticket.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleTicketSelection(ticket.id);
                      }
                    }}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedTickets.has(ticket.id)
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-purple-500/20 bg-black/20 hover:border-purple-500/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-white">
                          {ticket.ticket_type.name}
                        </h4>
                        <p className="text-sm text-gray-400">
                          ${parseFloat(ticket.ticket_type.price).toFixed(2)}
                        </p>
                      </div>
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          selectedTickets.has(ticket.id)
                            ? 'border-purple-500 bg-purple-500'
                            : 'border-gray-500'
                        }`}
                      >
                        {selectedTickets.has(ticket.id) && (
                          <div className="w-3 h-3 bg-white rounded-full" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Event Info */}
            {event && (
              <Card className="bg-black/40 backdrop-blur-lg border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-white">Event Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <h3 className="text-lg font-semibold text-white mb-2">{event.name}</h3>
                  <p className="text-gray-400 text-sm mb-1">{event.venue_name}</p>
                  <p className="text-gray-400 text-sm">
                    {new Date(event.start_date).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Transfer Form */}
          <div className="lg:col-span-1">
            <Card className="bg-black/40 backdrop-blur-lg border-purple-500/20 sticky top-4">
              <CardHeader>
                <CardTitle className="text-white">Recipient Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label htmlFor="recipient-name" className="text-sm text-gray-400 mb-2 block">
                    Recipient Name
                  </label>
                  <Input
                    id="recipient-name"
                    type="text"
                    placeholder="John Doe"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="bg-black/30 border-purple-500/30 text-white"
                  />
                </div>

                <div>
                  <label htmlFor="recipient-email" className="text-sm text-gray-400 mb-2 block">
                    Recipient Email
                  </label>
                  <Input
                    id="recipient-email"
                    type="email"
                    placeholder="john@example.com"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    className="bg-black/30 border-purple-500/30 text-white"
                  />
                </div>

                <div className="pt-4 border-t border-purple-500/20">
                  <div className="text-sm text-gray-400 mb-4">
                    <p className="mb-2">
                      <strong className="text-white">{selectedTickets.size}</strong> ticket(s) selected
                    </p>
                    <p className="text-xs text-yellow-400">
                      ⚠️ Transfers cannot be undone. The recipient will receive an email with their tickets.
                    </p>
                  </div>

                  <Button
                    onClick={handleTransfer}
                    disabled={transferring || selectedTickets.size === 0}
                    className="w-full " style={{ background: 'var(--gradient-brand-primary)' }}
                  >
                    {transferring ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Transferring...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Transfer Tickets
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
