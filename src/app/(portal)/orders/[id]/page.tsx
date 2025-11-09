'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/components/atoms/card';
import { Button } from '@/design-system/components/atoms/button';
import { Loader2, ArrowLeft, Download, Calendar, MapPin, DollarSign, User, Mail } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

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
        router.push('/login?redirect=/orders');
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
      router.push('/orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'pending':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'cancelled':
      case 'refunded':
        return 'text-red-400 bg-red-500/10 border-red-500/30';
      default:
        return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center " style={{ background: 'var(--gradient-hero)' }}>
        <Loader2 className="h-12 w-12 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center " style={{ background: 'var(--gradient-hero)' }}>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Order Not Found</h1>
          <Button asChild>
            <Link href="/orders">Back to Orders</Link>
          </Button>
        </div>
      </div>
    );
  }

  const event = order.tickets[0]?.ticket_type[0]?.event[0];

  return (
    <div className="min-h-screen  py-12 px-4" style={{ background: 'var(--gradient-hero)' }}>
      <div className="max-w-4xl mx-auto">
        <Button
          asChild
          variant="ghost"
          className="mb-6 text-gray-400 hover:text-white"
        >
          <Link href="/orders">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Link>
        </Button>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-white">
              Order #{order.id.slice(0, 8).toUpperCase()}
            </h1>
            <span
              className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(
                order.status
              )}`}
            >
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          </div>
          <p className="text-gray-400">
            Placed on {format(new Date(order.created_at), 'PPP')}
          </p>
        </div>

        <div className="grid gap-6">
          {/* Event Details */}
          {event && (
            <Card className="bg-black/40 backdrop-blur-lg border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white">Event Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">{event.name}</h3>
                  <p className="text-gray-400">{event.description}</p>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-purple-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-400">Date & Time</p>
                      <p className="text-white">
                        {format(new Date(event.start_date), 'PPP')}
                      </p>
                      <p className="text-sm text-gray-400">
                        {format(new Date(event.start_date), 'p')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-purple-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-400">Venue</p>
                      <p className="text-white">{event.venue_name}</p>
                      <p className="text-sm text-gray-400">{event.venue_address}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tickets */}
          <Card className="bg-black/40 backdrop-blur-lg border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white">Tickets ({order.tickets.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {order.tickets.map((ticket) => {
                  const ticketType = ticket.ticket_type[0];
                  return (
                    <div
                      key={ticket.id}
                      className="flex items-center justify-between p-4 bg-black/30 rounded-lg border border-purple-500/10"
                    >
                      <div>
                        <p className="text-white font-medium">{ticketType?.name || 'Ticket'}</p>
                        <p className="text-sm text-gray-400">
                          Ticket ID: {ticket.id.slice(0, 8).toUpperCase()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-medium">
                          ${parseFloat(ticketType?.price || '0').toFixed(2)}
                        </p>
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs mt-1 ${getStatusColor(
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
          <Card className="bg-black/40 backdrop-blur-lg border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal</span>
                  <span>${(parseFloat(order.total_amount) / 1.05).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Service Fee (5%)</span>
                  <span>${(parseFloat(order.total_amount) * 0.05 / 1.05).toFixed(2)}</span>
                </div>
                <div className="border-t border-purple-500/20 pt-2">
                  <div className="flex justify-between text-white text-lg font-bold">
                    <span>Total</span>
                    <span>${parseFloat(order.total_amount).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-purple-500/20 space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-400">
                  <User className="h-4 w-4" />
                  <span>Customer ID: {order.user_id.slice(0, 8)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <Mail className="h-4 w-4" />
                  <span>{userEmail}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <DollarSign className="h-4 w-4" />
                  <span>Payment ID: {order.stripe_payment_intent_id?.slice(0, 20)}...</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          {order.status === 'completed' && (
            <Card className="bg-black/40 backdrop-blur-lg border-purple-500/20">
              <CardContent className="py-6">
                <Button
                  asChild
                  className="w-full " style={{ background: 'var(--gradient-brand-primary)' }}
                >
                  <Link href={`/orders/${order.id}/tickets`}>
                    <Download className="h-4 w-4 mr-2" />
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
