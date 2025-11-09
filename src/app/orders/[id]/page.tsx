import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Download, Mail, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { TicketDisplay } from '@/components/features/ticket-display';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await params;

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return notFound();
  }

  // Fetch order with all related data
  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      *,
      events (
        id,
        name,
        slug,
        start_date,
        end_date,
        venue_name,
        venue_address,
        hero_image_url
      ),
      tickets (
        id,
        qr_code,
        status,
        ticket_type_id,
        attendee_name,
        attendee_email,
        ticket_types (
          name,
          description,
          price
        )
      )
    `)
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error || !order) {
    return notFound();
  }

  const orderDate = new Date(order.created_at);
  const isCompleted = order.status === 'completed';

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/profile"
            className="text-purple-400 hover:text-purple-300 mb-4 inline-block"
          >
            ← Back to Profile
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Order #{order.id.slice(0, 8).toUpperCase()}
              </h1>
              <p className="text-gray-400 mt-1">
                Placed on {orderDate.toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </p>
            </div>
            {isCompleted && (
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle className="h-6 w-6" />
                <span className="font-semibold">Confirmed</span>
              </div>
            )}
          </div>
        </div>

        {/* Order Status */}
        <Card className="bg-black/40 backdrop-blur-lg border-purple-500/20 mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Order Status</p>
                <p className="text-xl font-bold text-white capitalize">{order.status}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">Total Amount</p>
                <p className="text-2xl font-bold text-purple-400">
                  ${order.total_amount.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Event Information */}
        {order.events && (
          <Card className="bg-black/40 backdrop-blur-lg border-purple-500/20 mb-6">
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                {order.events.hero_image_url && (
                  <div className="w-32 h-32 rounded-lg overflow-hidden flex-shrink-0 relative">
                    <Image
                      src={order.events.hero_image_url}
                      alt={order.events.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">
                    {order.events.name}
                  </h3>
                  <div className="space-y-2 text-gray-400">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(order.events.start_date).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    {order.events.venue_name && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{order.events.venue_name}</span>
                      </div>
                    )}
                  </div>
                  <Link
                    href={`/events/${order.events.slug}`}
                    className="text-purple-400 hover:text-purple-300 text-sm mt-2 inline-block"
                  >
                    View Event Details →
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tickets */}
        {order.tickets && order.tickets.length > 0 && (
          <Card className="bg-black/40 backdrop-blur-lg border-purple-500/20 mb-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Your Tickets ({order.tickets.length})</span>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-purple-500/30"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download All
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.tickets.map((ticket: any) => (
                <TicketDisplay
                  key={ticket.id}
                  ticket={{
                    id: ticket.id,
                    qr_code: ticket.qr_code,
                    ticket_types: {
                      name: ticket.ticket_types?.name || 'General Admission',
                      price: ticket.ticket_types?.price || '0',
                    },
                    orders: {
                      events: {
                        name: order.events?.name || 'Event',
                        start_date: order.events?.start_date || new Date().toISOString(),
                        venue_name: order.events?.venue_name || 'TBA',
                        hero_image_url: order.events?.hero_image_url,
                      },
                    },
                  }}
                />
              ))}
            </CardContent>
          </Card>
        )}

        {/* Order Items */}
        <Card className="bg-black/40 backdrop-blur-lg border-purple-500/20 mb-6">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {order.order_items && Array.isArray(order.order_items) && order.order_items.map((item: any, index: number) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-purple-500/10 last:border-0">
                  <div>
                    <p className="font-medium text-white">{item.name || item.ticket_type_id}</p>
                    <p className="text-sm text-gray-400">Quantity: {item.quantity}</p>
                  </div>
                  <p className="font-semibold text-purple-400">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
              <div className="flex justify-between items-center pt-4 border-t border-purple-500/20">
                <p className="text-lg font-bold text-white">Total</p>
                <p className="text-2xl font-bold text-purple-400">
                  ${order.total_amount.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            variant="outline"
            className="flex-1 border-purple-500/30"
            asChild
          >
            <Link href={`mailto:support@grasshopper.com?subject=Order ${order.id.slice(0, 8)}`}>
              <Mail className="h-4 w-4 mr-2" />
              Contact Support
            </Link>
          </Button>
          <Button
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Receipt
          </Button>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center text-sm text-gray-400">
          <p>
            Need help? Contact us at{' '}
            <a href="mailto:support@grasshopper.com" className="text-purple-400 hover:text-purple-300">
              support@grasshopper.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
