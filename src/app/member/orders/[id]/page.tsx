'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardHeader, CardTitle, CardContent, Button, Heading, Text, Stack } from '@/design-system';
import { Loader2, ArrowLeft, Download, Calendar, MapPin, DollarSign, User, Mail } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import styles from './page.module.css';

interface OrderDetails {
  id: string;
  created_at: string;
  status: string;
  total_amount: string;
  stripe_payment_intent_id: string;
  user_id: string;
  tickets: Array<{
    id: string;
    status: string;
    qr_code: string;
    ticket_type: Array<{
      name: string;
      price: string;
      event: Array<{
        id: string;
        name: string;
        start_date: string;
        end_date: string;
        venue_name: string;
        venue_address: string;
        description: string;
      }>;
    }>;
  }>;
}

const getStatusColor = (status: string): string => {
  // GHXSTSHIP monochromatic design - using grey scale only
  switch (status.toLowerCase()) {
    case 'completed':
    case 'active':
    case 'valid':
      return styles.bgBlack + ' ' + styles.textWhite;
    case 'pending':
    case 'processing':
      return styles.bgWhite + ' ' + styles.textBlack + ' ' + styles.borderBlack;
    case 'cancelled':
    case 'refunded':
    case 'invalid':
      return styles.textGrey600;
    default:
      return styles.bgWhite + ' ' + styles.textBlack;
  }
};

export default function OrderDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const supabase = createClient();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    loadOrderDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadOrderDetails = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login?redirect=/portal/orders');
        return;
      }

      setUserEmail(user.email || '');

      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          created_at,
          status,
          total_amount,
          stripe_payment_intent_id,
          user_id,
          tickets (
            id,
            status,
            qr_code,
            ticket_type:ticket_types (
              name,
              price,
              event:events (
                id,
                name,
                start_date,
                end_date,
                venue_name,
                venue_address,
                description
              )
            )
          )
        `)
        .eq('id', params.id)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      setOrder(data as any);
    } catch (error) {
      console.error('Error loading order:', error);
      router.push('/portal/orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusVariant = (status: string): 'sold-out' | 'on-sale' | 'coming-soon' | 'live' | 'ended' => {
    switch (status) {
      case 'completed':
        return 'on-sale';
      case 'pending':
        return 'coming-soon';
      case 'cancelled':
      case 'refunded':
        return 'ended';
      default:
        return 'coming-soon';
    }
  };

  if (loading) {
    return (
      <div className={`${styles.row} ${styles.heroGradient}`}>
        <Loader2 className={styles.spinner} />
      </div>
    );
  }

  if (!order) {
    return (
      <div className={`${styles.row} ${styles.heroGradient}`}>
        <div >
          <h1 className={styles.title}>Order Not Found</h1>
          <Button asChild>
            <Link href="/orders">Back to Orders</Link>
          </Button>
        </div>
      </div>
    );
  }

  const event = order.tickets[0]?.ticket_type[0]?.event[0];

  return (
    <div className={`${styles.container} ${styles.heroGradient}`}>
      <div className={styles.content}>
        <Button
          asChild
          variant="ghost"
          className={styles.text}
        >
          <Link href="/orders">
            <ArrowLeft className={styles.icon} />
            Back to Orders
          </Link>
        </Button>

        <div className={styles.section}>
          <div className={styles.row}>
            <h1 className={styles.title}>
              Order #{order.id.slice(0, 8).toUpperCase()}
            </h1>
            <span
              className={`${styles.statusBadge} ${getStatusColor(
                order.status
              )}`}
            >
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          </div>
          <p >
            Placed on {format(new Date(order.created_at), 'PPP')}
          </p>
        </div>

        <div className={styles.grid}>
          {/* Event Details */}
          {event && (
            <Card >
              <CardHeader>
                <CardTitle >Event Details</CardTitle>
              </CardHeader>
              <CardContent className={styles.section}>
                <div>
                  <h3 className={styles.title}>{event.name}</h3>
                  <p >{event.description}</p>
                </div>
                <div className={styles.grid}>
                  <div className={styles.card}>
                    <Calendar className={styles.icon} />
                    <div>
                      <p className={styles.subtitle}>Date & Time</p>
                      <p >
                        {format(new Date(event.start_date), 'PPP')}
                      </p>
                      <p className={styles.subtitle}>
                        {format(new Date(event.start_date), 'p')}
                      </p>
                    </div>
                  </div>
                  <div className={styles.card}>
                    <MapPin className={styles.icon} />
                    <div>
                      <p className={styles.subtitle}>Venue</p>
                      <p >{event.venue_name}</p>
                      <p className={styles.subtitle}>{event.venue_address}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tickets */}
          <Card >
            <CardHeader>
              <CardTitle >Tickets ({order.tickets.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={styles.section}>
                {order.tickets.map((ticket) => {
                  const ticketType = ticket.ticket_type[0];
                  return (
                    <div
                      key={ticket.id}
                      className={styles.row}
                    >
                      <div>
                        <p className={styles.text}>{ticketType?.name || 'Ticket'}</p>
                        <p className={styles.subtitle}>
                          Ticket ID: {ticket.id.slice(0, 8).toUpperCase()}
                        </p>
                      </div>
                      <div >
                        <p className={styles.text}>
                          ${parseFloat(ticketType?.price || '0').toFixed(2)}
                        </p>
                        <span
                          className={`${styles.ticketStatusBadge} ${getStatusColor(
                            ticket.status
                          )}`}
                        >
                          {ticket.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card >
            <CardHeader>
              <CardTitle >Order Summary</CardTitle>
            </CardHeader>
            <CardContent className={styles.section}>
              <div className={styles.section}>
                <div className={styles.text}>
                  <span>Subtotal</span>
                  <span>${(parseFloat(order.total_amount) / 1.05).toFixed(2)}</span>
                </div>
                <div className={styles.text}>
                  <span>Service Fee (5%)</span>
                  <span>${(parseFloat(order.total_amount) * 0.05 / 1.05).toFixed(2)}</span>
                </div>
                <div className={styles.card}>
                  <div className={styles.text}>
                    <span>Total</span>
                    <span>${parseFloat(order.total_amount).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className={styles.section}>
                <div className={styles.row}>
                  <User className={styles.icon} />
                  <span>Customer ID: {order.user_id.slice(0, 8)}</span>
                </div>
                <div className={styles.row}>
                  <Mail className={styles.icon} />
                  <span>{userEmail}</span>
                </div>
                <div className={styles.row}>
                  <DollarSign className={styles.icon} />
                  <span>Payment ID: {order.stripe_payment_intent_id?.slice(0, 20)}...</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          {order.status === 'completed' && (
            <Card >
              <CardContent >
                <Button
                  asChild
                  className={`${styles.fullWidth} ${styles.brandGradient}`}
                >
                  <Link href={`/orders/${order.id}/tickets`}>
                    <Download className={styles.icon} />
                    Download Tickets
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
