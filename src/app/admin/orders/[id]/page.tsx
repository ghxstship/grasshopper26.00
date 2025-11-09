'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/components/atoms/card';
import { Button } from '@/design-system/components/atoms/button';
import { Badge } from '@/design-system/components/atoms/badge';
import { ArrowLeft, Mail, RefreshCw, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

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
      // Update order status
      const { error: orderError } = await supabase
        .from('orders')
        .update({ status: 'refunded' })
        .eq('id', orderId);

      if (orderError) throw orderError;

      // Cancel tickets
      const { error: ticketsError } = await supabase
        .from('tickets')
        .update({ status: 'cancelled' })
        .eq('order_id', orderId);

      if (ticketsError) throw ticketsError;

      toast.success('Order refunded successfully');
      fetchOrder(orderId);
    } catch (error) {
      console.error('Error refunding order:', error);
      toast.error('Failed to refund order');
    } finally {
      setProcessing(false);
    }
  }

  async function resendConfirmation() {
    setProcessing(true);
    try {
      const response = await fetch('/api/orders/resend-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });

      if (!response.ok) throw new Error('Failed to resend');

      toast.success('Confirmation email sent');
    } catch (error) {
      toast.error('Failed to send email');
    } finally {
      setProcessing(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen  flex items-center justify-center" style={{ background: 'var(--gradient-hero)' }}>
        <RefreshCw className="h-8 w-8 animate-spin text-purple-400" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen  flex items-center justify-center" style={{ background: 'var(--gradient-hero)' }}>
        <p className="text-white">Order not found</p>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    completed: 'bg-green-500/20 text-green-400 border-green-500/30',
    pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
    refunded: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  };

  return (
    <div className="min-h-screen  py-12 px-4" style={{ background: 'var(--gradient-hero)' }}>
      <div className="max-w-4xl mx-auto">
        <Button
          onClick={() => router.back()}
          variant="ghost"
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Button>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Order #{order.id.slice(0, 8).toUpperCase()}
            </h1>
            <p className="text-gray-400 mt-1">
              {new Date(order.created_at).toLocaleString()}
            </p>
          </div>
          <Badge className={statusColors[order.status]}>
            {order.status}
          </Badge>
        </div>

        <div className="grid gap-6">
          <Card className="bg-black/40 backdrop-blur-lg border-purple-500/20">
            <CardHeader>
              <CardTitle>Order Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Order ID</p>
                  <p className="text-white font-mono">{order.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">User ID</p>
                  <p className="text-white font-mono">{order.user_id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Total Amount</p>
                  <p className="text-2xl font-bold text-purple-400">
                    ${order.total_amount.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Payment Intent</p>
                  <p className="text-white font-mono text-sm">
                    {order.stripe_payment_intent_id || 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {order.events && (
            <Card className="bg-black/40 backdrop-blur-lg border-purple-500/20">
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
              </CardHeader>
              <CardContent>
                <h3 className="text-xl font-bold text-white mb-2">
                  {order.events.name}
                </h3>
                <div className="space-y-1 text-gray-400">
                  <p>Date: {new Date(order.events.start_date).toLocaleDateString()}</p>
                  <p>Venue: {order.events.venue_name}</p>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="bg-black/40 backdrop-blur-lg border-purple-500/20">
            <CardHeader>
              <CardTitle>Tickets ({order.tickets?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {order.tickets?.map((ticket: any) => (
                  <div
                    key={ticket.id}
                    className="p-4 rounded-lg bg-purple-900/20 border border-purple-500/20"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-white">
                          {ticket.ticket_types?.name || 'Ticket'}
                        </p>
                        <p className="text-sm text-gray-400">
                          ID: {ticket.id.slice(0, 8)}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge
                          className={
                            ticket.status === 'active'
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-gray-500/20 text-gray-400'
                          }
                        >
                          {ticket.status}
                        </Badge>
                        <p className="text-sm text-gray-400 mt-1">
                          ${ticket.ticket_types?.price || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-lg border-purple-500/20">
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-4">
              <Button
                onClick={resendConfirmation}
                disabled={processing}
                variant="outline"
                className="border-purple-500/30"
              >
                <Mail className="h-4 w-4 mr-2" />
                Resend Confirmation
              </Button>
              {order.status === 'completed' && (
                <Button
                  onClick={handleRefund}
                  disabled={processing}
                  variant="destructive"
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Issue Refund
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
