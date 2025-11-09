'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/components/atoms/card';
import { Button } from '@/design-system/components/atoms/button';
import { Loader2, Package, Calendar, DollarSign, Download } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

interface Order {
  id: string;
  created_at: string;
  status: string;
  total_amount: string;
  tickets: Array<{
    id: string;
    status: string;
    ticket_type: Array<{
      name: string;
      event: Array<{
        name: string;
        start_date: string;
        venue_name: string;
      }>;
    }>;
  }>;
}

export default function OrderHistoryPage() {
  const router = useRouter();
  const supabase = createClient();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadOrders = async () => {
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
          created_at,
          status,
          total_amount,
          tickets (
            id,
            status,
            ticket_type:ticket_types (
              name,
              event:events (
                name,
                start_date,
                venue_name
              )
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setOrders((data as any) || []);
    } catch (error) {
      console.error('Error loading orders:', error);
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

  return (
    <div className="min-h-screen  py-12 px-4" style={{ background: 'var(--gradient-hero)' }}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold  mb-2 bg-clip-text text-transparent" style={{ backgroundImage: 'var(--gradient-brand-primary)' }}>
            Order History
          </h1>
          <p className="text-gray-400">View all your past and current orders</p>
        </div>

        {orders.length === 0 ? (
          <Card className="bg-black/40 backdrop-blur-lg border-purple-500/20">
            <CardContent className="py-12 text-center">
              <Package className="h-16 w-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Orders Yet</h3>
              <p className="text-gray-400 mb-6">
                You haven&apos;t placed any orders yet. Start exploring events!
              </p>
              <Button
                asChild
                className="" style={{ background: 'var(--gradient-brand-primary)' }}
              >
                <Link href="/events">Browse Events</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card
                key={order.id}
                className="bg-black/40 backdrop-blur-lg border-purple-500/20 hover:border-purple-500/40 transition-colors"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-white mb-2">
                        Order #{order.id.slice(0, 8).toUpperCase()}
                      </CardTitle>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(order.created_at), 'MMM dd, yyyy')}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          ${parseFloat(order.total_amount).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {order.tickets.map((ticket) => {
                      const ticketType = ticket.ticket_type[0];
                      const event = ticketType?.event[0];
                      
                      return (
                      <div
                        key={ticket.id}
                        className="flex items-center justify-between p-3 bg-black/30 rounded-lg border border-purple-500/10"
                      >
                        <div>
                          <p className="text-white font-medium">
                            {event?.name || 'Event'}
                          </p>
                          <p className="text-sm text-gray-400">
                            {ticketType?.name || 'Ticket'} • {event?.venue_name || 'Venue'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {event?.start_date ? format(new Date(event.start_date), 'PPP') : 'Date TBD'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-1 rounded text-xs ${getStatusColor(
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
                  <div className="mt-4 flex gap-2">
                    <Button
                      asChild
                      variant="outline"
                      className="flex-1 border-purple-500/30 hover:bg-purple-500/10"
                    >
                      <Link href={`/orders/${order.id}`}>View Details</Link>
                    </Button>
                    {order.status === 'completed' && (
                      <Button
                        asChild
                        className="flex-1 " style={{ background: 'var(--gradient-brand-primary)' }}
                      >
                        <Link href={`/orders/${order.id}/tickets`}>
                          <Download className="h-4 w-4 mr-2" />
                          Download Tickets
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
