import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/design-system';
import { Button } from '@/design-system';
import { Calendar, MapPin, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import styles from './page.module.css';

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
    <main className={styles.container}>
      {/* Header */}
      <section className={styles.card}>
        <div className={styles.content}>
          <Link
            href="/portal"
            className={styles.row}
          >
            ← Back to Portal
          </Link>
          <h1 className={styles.container}>
            Order History
          </h1>
          <p className={styles.text}>
            View and manage your past orders, tickets, and merchandise purchases
          </p>
        </div>
      </section>

      {/* Orders List */}
      <section >
        <div className={styles.container}>

          {!orders || orders.length === 0 ? (
            <div className={styles.card}>
              <p >No Orders Yet</p>
              <p className={styles.text}>
                Start exploring events and get your tickets!
              </p>
              <Button
                asChild
                className={styles.card}
              >
                <Link href="/events">Browse Events</Link>
              </Button>
            </div>
          ) : (
            <div className={styles.section}>
              {orders.map((order) => {
                const orderDate = new Date(order.created_at);
                const statusColors = {
                  completed: 'bg-grey-100 text-white',
                  pending: 'bg-grey-100 text-black',
                  cancelled: 'bg-grey-100 text-white',
                  refunded: 'bg-grey-500 text-white',
                };

                return (
                  <Link key={order.id} href={`/orders/${order.id}`}>
                    <article className={styles.card}>
                      <div className={styles.card}>
                        <div className={styles.row}>
                          {order.events?.hero_image_url && (
                            <div className={styles.card}>
                              <Image
                                src={order.events.hero_image_url}
                                alt={order.events.name}
                                fill
                                className={styles.orderImage}
                              />
                            </div>
                          )}
                          <div className={styles.container}>
                            <div className={styles.container}>
                              <div>
                                <h3 className={styles.container}>
                                  {order.events?.name || 'Order'}
                                </h3>
                                <p className={styles.text}>
                                  Order #{order.id.slice(0, 8).toUpperCase()}
                                </p>
                              </div>
                              <span
                                className={`${styles.orderStatusBadge} ${
                                  statusColors[order.status as keyof typeof statusColors] ||
                                  statusColors.pending
                                }`}
                              >
                                {order.status}
                              </span>
                            </div>
                            <div className={styles.section}>
                              <div className={styles.row}>
                                <Calendar className={styles.icon} />
                                <span>
                                  Ordered {orderDate.toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                  })}
                                </span>
                              </div>
                              {order.events?.venue_name && (
                                <div className={styles.row}>
                                  <MapPin className={styles.icon} />
                                  <span>{order.events.venue_name}</span>
                                </div>
                              )}
                            </div>
                            <div className={styles.header}>
                              <p className={styles.container}>
                                ${order.total_amount.toFixed(2)}
                              </p>
                              <ChevronRight className={styles.icon} />
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
