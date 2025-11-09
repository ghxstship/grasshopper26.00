import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/design-system/components/atoms/card';
import { Button } from '@/design-system/components/atoms/button';
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
    <main className="min-h-screen bg-white">
      {/* Header */}
      <section className="border-b-3 border-black py-12 md:py-20">
        <div className="container mx-auto px-4">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 font-bebas text-body uppercase mb-6 hover:underline"
          >
            ← Back to Profile
          </Link>
          <h1 className="font-anton text-hero uppercase mb-4">
            Order History
          </h1>
          <p className="font-share text-body text-grey-700 max-w-2xl">
            View and manage your past orders, tickets, and merchandise purchases
          </p>
        </div>
      </section>

      {/* Orders List */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-4xl">

          {!orders || orders.length === 0 ? (
            <div className="border-3 border-black bg-grey-50 p-12 text-center">
              <p className="font-bebas text-h3 uppercase mb-4">No Orders Yet</p>
              <p className="font-share text-body text-grey-600 mb-6">
                Start exploring events and get your tickets!
              </p>
              <Button
                asChild
                className="bg-black text-white hover:bg-white hover:text-black border-3 border-black font-bebas text-body uppercase"
              >
                <Link href="/events">Browse Events</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => {
                const orderDate = new Date(order.created_at);
                const statusColors = {
                  completed: 'bg-green-500 text-white',
                  pending: 'bg-yellow-500 text-black',
                  cancelled: 'bg-red-500 text-white',
                  refunded: 'bg-grey-500 text-white',
                };

                return (
                  <Link key={order.id} href={`/orders/${order.id}`}>
                    <article className="border-3 border-black bg-white hover:bg-black hover:text-white transition-colors shadow-geometric group">
                      <div className="p-6">
                        <div className="flex gap-6">
                          {order.events?.hero_image_url && (
                            <div className="w-32 h-32 border-3 border-black overflow-hidden flex-shrink-0 relative">
                              <Image
                                src={order.events.hero_image_url}
                                alt={order.events.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h3 className="font-bebas text-h3 uppercase truncate mb-1 group-hover:text-white">
                                  {order.events?.name || 'Order'}
                                </h3>
                                <p className="font-share-mono text-meta text-grey-600 group-hover:text-grey-300">
                                  Order #{order.id.slice(0, 8).toUpperCase()}
                                </p>
                              </div>
                              <span
                                className={`px-4 py-1 font-bebas text-meta uppercase ${
                                  statusColors[order.status as keyof typeof statusColors] ||
                                  statusColors.pending
                                }`}
                              >
                                {order.status}
                              </span>
                            </div>
                            <div className="space-y-2 font-share text-body text-grey-700 group-hover:text-grey-300 mb-4">
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
                              <p className="font-bebas text-h4 uppercase group-hover:text-white">
                                ${order.total_amount.toFixed(2)}
                              </p>
                              <ChevronRight className="h-5 w-5 text-grey-600 group-hover:text-white" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
