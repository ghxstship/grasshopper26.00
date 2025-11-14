'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ContextualPageTemplate } from '@/design-system';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system';
import { Button } from '@/design-system';
import { Badge } from '@/design-system';
import { Mail, RefreshCw, DollarSign, Package } from 'lucide-react';
import { toast } from 'sonner';
import styles from './order-detail-content.module.css';

export default function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const supabase = createClient();
  const [order, setOrder] = useState<any>(null);
  const [orderId, setOrderId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const fetchOrder = useCallback(async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          events (name, slug, start_date, venue_name),
          tickets (
            id,
            status,
            qr_code,
            ticket_types (name, price)
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setOrder(data);
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Failed to load order');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    async function initAndFetch() {
      const resolvedParams = await params;
      setOrderId(resolvedParams.id);
      fetchOrder(resolvedParams.id);
    }
    initAndFetch();
  }, [params, fetchOrder]);

  async function handleRefund() {
    if (!confirm('Are you sure you want to refund this order?')) return;

    setProcessing(true);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/refund`, {
        method: 'POST',
      });

      if (response.ok) {
        toast.success('Order refunded successfully');
        fetchOrder(orderId);
      } else {
        toast.error('Failed to refund order');
      }
    } catch (error) {
      toast.error('Failed to refund order');
    } finally {
      setProcessing(false);
    }
  }

  async function handleResendTickets() {
    setProcessing(true);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/resend-tickets`, {
        method: 'POST',
      });

      if (response.ok) {
        toast.success('Tickets resent successfully');
      } else {
        toast.error('Failed to resend tickets');
      }
    } catch (error) {
      toast.error('Failed to resend tickets');
    } finally {
      setProcessing(false);
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: 'default' as const,
      pending: 'outline' as const,
      cancelled: 'solid' as const,
      refunded: 'outline' as const,
    };
    return variants[status as keyof typeof variants] || 'outline';
  };

  if (!order) {
    return null;
  }

  const event = order.events;
  const totalAmount = order.total_amount || 0;

  return (
    <ContextualPageTemplate
      breadcrumbs={[
        { label: 'Orders', href: '/admin/orders' },
        { label: `Order #${order.order_number}`, href: `/admin/orders/${orderId}` }
      ]}
      title={`Order #${order.order_number}`}
      subtitle={`${order.customer_name} • ${order.customer_email} • Status: ${order.status}`}
      metadata={
        <div>{order.tickets?.length || 0} Tickets • ${totalAmount.toFixed(2)} • {new Date(order.created_at).toLocaleDateString()}</div>
      }
      loading={loading}
    >
      <div className={styles.contentGrid}>
        <Card>
          <CardHeader>
            <CardTitle>Event Details</CardTitle>
          </CardHeader>
          <CardContent>
            {event && (
              <div className={styles.eventDetails}>
                <div className={styles.detailRow}>
                  <span className={styles.label}>Event:</span>
                  <span className={styles.value}>{event.name}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.label}>Venue:</span>
                  <span className={styles.value}>{event.venue_name}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.label}>Date:</span>
                  <span className={styles.value}>
                    {new Date(event.start_date).toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tickets ({order.tickets?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={styles.ticketsList}>
              {order.tickets?.map((ticket: any) => (
                <div key={ticket.id} className={styles.ticketItem}>
                  <div className={styles.ticketInfo}>
                    <span className={styles.ticketType}>
                      {ticket.ticket_types?.name || 'General Admission'}
                    </span>
                    <Badge variant={ticket.status === 'valid' ? 'default' : 'outline'}>
                      {ticket.status}
                    </Badge>
                  </div>
                  <span className={styles.ticketPrice}>
                    ${ticket.ticket_types?.price?.toFixed(2) || '0.00'}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={styles.paymentDetails}>
              <div className={styles.detailRow}>
                <span className={styles.label}>Payment Method:</span>
                <span className={styles.value}>{order.payment_method || 'Card'}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.label}>Transaction ID:</span>
                <span className={styles.value}>{order.stripe_payment_intent_id || 'N/A'}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.label}>Amount:</span>
                <span className={styles.valueHighlight}>${totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ContextualPageTemplate>
  );
}
