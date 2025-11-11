'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ContextualPageTemplate } from '@/design-system/components/templates';
import { Button } from '@/design-system/components/atoms/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/components/atoms/Card';
import { Badge } from '@/design-system/components/atoms/Badge';
import { Mail, CheckCircle, Ticket } from 'lucide-react';
import { toast } from 'sonner';
import styles from './resend-content.module.css';

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
  }, [id]);

  async function fetchOrder() {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/orders/${id}`);
      const data = await response.json();
      
      if (data.order) {
        setOrder(data.order);
        setTickets(data.order.tickets || []);
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

  async function handleResend() {
    if (selectedTickets.size === 0) {
      toast.error('Please select at least one ticket to resend');
      return;
    }

    setSending(true);
    try {
      const response = await fetch(`/api/admin/orders/${id}/resend-tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketIds: Array.from(selectedTickets),
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Tickets resent successfully');
        router.push(`/admin/orders/${id}`);
      } else {
        toast.error(data.error || 'Failed to resend tickets');
      }
    } catch (error) {
      console.error('Resend error:', error);
      toast.error('Failed to resend tickets');
    } finally {
      setSending(false);
    }
  }

  return (
    <ContextualPageTemplate
      breadcrumbs={[
        { label: 'Orders', href: '/admin/orders' },
        { label: `Order #${order?.order_number || id}`, href: `/admin/orders/${id}` },
        { label: 'Resend Tickets', href: `/admin/orders/${id}/resend-tickets` }
      ]}
      title="Resend Tickets"
      subtitle={order ? `Order #${order.order_number} - ${order.customer_name}` : 'Loading...'}
      primaryAction={{
        label: sending ? 'Sending...' : `Resend ${selectedTickets.size} Ticket(s)`,
        onClick: handleResend,
        icon: <Mail />
      }}
      loading={loading}
    >
      <Card>
        <CardHeader>
          <CardTitle>Select Tickets to Resend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={styles.ticketsList}>
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
                role="button"
                tabIndex={0}
className={`${styles.ticketItem} ${selectedTickets.has(ticket.id) ? styles.selected : ''}`}
              >
                {selectedTickets.has(ticket.id) && <CheckCircle />}
                <Ticket />
                <div className={styles.ticketInfo}>
                  <div>{ticket.ticket_type?.name || 'General Admission'}</div>
                  <div className={styles.ticketNumber}>
                    {ticket.ticket_number}
                  </div>
                </div>
                <Badge variant={ticket.status === 'valid' ? 'default' : 'outlined'}>
                  {ticket.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </ContextualPageTemplate>
  );
}
