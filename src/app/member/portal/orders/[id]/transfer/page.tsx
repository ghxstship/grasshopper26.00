'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/components/atoms/Card';
import { Button } from '@/design-system/components/atoms/Button';
import { Input } from '@/design-system/components/atoms/Input';
import { Loader2, ArrowLeft, Send, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import styles from './page.module.css';

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
        router.push('/login?redirect=/portal/orders');
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
      router.push('/portal/orders');
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
      router.push(`/portal/orders/${params.id}`);
    } catch (error) {
      console.error('Error transferring tickets:', error);
      toast.error('Failed to transfer tickets. Please try again.');
    } finally {
      setTransferring(false);
    }
  };

  if (loading) {
    return (
      <div className={`${styles.row} ${styles.heroGradient}`}>
        <Loader2 className={styles.spinner} />
      </div>
    );
  }

  if (!order || order.tickets.length === 0) {
    return (
      <div className={`${styles.container} ${styles.heroGradient}`}>
        <div className={styles.content}>
          <Card >
            <CardContent className={styles.section}>
              <AlertCircle className={styles.alertIcon} />
              <h3 className={styles.alertTitle}>No Transferable Tickets</h3>
              <p className={styles.alertText}>
                This order has no tickets available for transfer.
              </p>
              <Button asChild className={styles.brandGradient}>
                <Link href="/orders">
                  <ArrowLeft className={styles.icon} />
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
    <div className={`${styles.container} ${styles.heroGradient}`}>
      <div className={styles.content}>
        {/* Header */}
        <div className={styles.section}>
          <Button
            asChild
            variant="ghost"
            className={styles.backButton}
          >
            <Link href={`/orders/${params.id}`}>
              <ArrowLeft className={styles.icon} />
              Back to Order
            </Link>
          </Button>
          <h1 className={styles.title}>Transfer Tickets</h1>
          <p >
            Transfer tickets to another person via email
          </p>
        </div>

        <div className={styles.grid}>
          {/* Ticket Selection */}
          <div className={styles.section}>
            <Card >
              <CardHeader>
                <CardTitle >Select Tickets to Transfer</CardTitle>
              </CardHeader>
              <CardContent className={styles.section}>
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
                    className={`${styles.ticketCard} ${
                      selectedTickets.has(ticket.id)
                        ? styles.ticketCardSelected
                        : ''
                    }`}
                  >
                    <div className={styles.header}>
                      <div>
                        <h4 className={styles.ticketName}>
                          {ticket.ticket_type.name}
                        </h4>
                        <p className={styles.subtitle}>
                          ${parseFloat(ticket.ticket_type.price).toFixed(2)}
                        </p>
                      </div>
                      <div
                        className={`${styles.checkbox} ${
                          selectedTickets.has(ticket.id)
                            ? styles.checkboxChecked
                            : ''
                        }`}
                      >
                        {selectedTickets.has(ticket.id) && (
                          <div className={styles.checkmark} />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Event Info */}
            {event && (
              <Card >
                <CardHeader>
                  <CardTitle >Event Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <h3 className={styles.eventName}>{event.name}</h3>
                  <p className={styles.eventVenue}>{event.venue_name}</p>
                  <p className={styles.eventDate}>
                    {new Date(event.start_date).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Transfer Form */}
          <div className={styles.formColumn}>
            <Card className={styles.formCard}>
              <CardHeader>
                <CardTitle >Recipient Information</CardTitle>
              </CardHeader>
              <CardContent className={styles.section}>
                <div>
                  <label htmlFor="recipient-name" className={styles.label}>
                    Recipient Name
                  </label>
                  <Input
                    id="recipient-name"
                    type="text"
                    placeholder="John Doe"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className={styles.input}
                  />
                </div>

                <div>
                  <label htmlFor="recipient-email" className={styles.label}>
                    Recipient Email
                  </label>
                  <Input
                    id="recipient-email"
                    type="email"
                    placeholder="john@example.com"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    className={styles.input}
                  />
                </div>

                <div className={styles.summary}>
                  <div className={styles.summaryText}>
                    <p>
                      <strong >{selectedTickets.size}</strong> ticket(s) selected
                    </p>
                    <p className={styles.warning}>
                      ⚠️ Transfers cannot be undone. The recipient will receive an email with their tickets.
                    </p>
                  </div>

                  <Button
                    onClick={handleTransfer}
                    disabled={transferring || selectedTickets.size === 0}
                    className={`${styles.submitButton} ${styles.brandGradient}`}
                  >
                    {transferring ? (
                      <>
                        <Loader2 className={styles.buttonIcon} />
                        Transferring...
                      </>
                    ) : (
                      <>
                        <Send className={styles.icon} />
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
