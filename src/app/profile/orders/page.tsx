import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';

export default async function OrdersPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/profile/orders');
  }

  const { data: orders } = await supabase
    .from('orders')
    .select(`
      *,
      events (
        name,
        slug,
        start_date,
        venue_name,
        hero_image_url
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link
            href="/profile"
            className="text-purple-400 hover:text-purple-300 mb-4 inline-block"
          >
            ← Back to Profile
          </Link>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Order History
          </h1>
          <p className="text-gray-400 mt-2">View and manage your past orders</p>
        </div>

        {!orders || orders.length === 0 ? (
          <Card className="bg-black/40 backdrop-blur-lg border-purple-500/20">
            <CardContent className="p-12 text-center">
              <p className="text-gray-400 text-lg mb-4">No orders yet</p>
              <p className="text-gray-500 mb-6">
                Start exploring events and get your tickets!
              </p>
              <Button
                asChild
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Link href="/events">Browse Events</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const orderDate = new Date(order.created_at);
              const statusColors = {
                completed: 'text-green-400 bg-green-400/10',
                pending: 'text-yellow-400 bg-yellow-400/10',
                cancelled: 'text-red-400 bg-red-400/10',
                refunded: 'text-gray-400 bg-gray-400/10',
              };

              return (
                <Link key={order.id} href={`/orders/${order.id}`}>
                  <Card className="bg-black/40 backdrop-blur-lg border-purple-500/20 hover:bg-black/60 transition-all cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        {order.events?.hero_image_url && (
                          <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 relative">
                            <Image
                              src={order.events.hero_image_url}
                              alt={order.events.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-lg font-bold text-white truncate">
                                {order.events?.name || 'Order'}
                              </h3>
                              <p className="text-sm text-gray-400">
                                Order #{order.id.slice(0, 8).toUpperCase()}
                              </p>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                statusColors[order.status as keyof typeof statusColors] ||
                                statusColors.pending
                              }`}
                            >
                              {order.status}
                            </span>
                          </div>
                          <div className="space-y-1 text-sm text-gray-400 mb-3">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>
                                Ordered {orderDate.toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </span>
                            </div>
                            {order.events?.venue_name && (
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span>{order.events.venue_name}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-lg font-bold text-purple-400">
                              ${order.total_amount.toFixed(2)}
                            </p>
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
