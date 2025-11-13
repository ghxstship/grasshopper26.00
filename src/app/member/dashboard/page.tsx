'use client';

import { PortalLayout } from '@/design-system/components/templates/PortalLayout/PortalLayout';
import { PortalSidebar } from '@/design-system/components/organisms/PortalSidebar/PortalSidebar';
import { Typography } from '@/design-system/components/atoms/Typography/Typography';
import { StatCard } from '@/design-system/components/molecules/StatCard/StatCard';
import { Ticket, Gift, Calendar, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import styles from './page.module.css';

export default function MemberPortalPage() {
  const [stats, setStats] = useState({
    orders: 0,
    credits: 0,
    upcomingEvents: 0,
    referrals: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const supabase = createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('Auth error:', authError);
        return;
      }
      
      if (!user) {
        console.error('No user found');
        return;
      }

      const { count: ordersCount, error: ordersError } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (ordersError) {
        console.error('Error fetching orders count:', ordersError);
      }

      // Get membership credits from user_memberships table
      const { data: membership, error: creditsError } = await supabase
        .from('user_memberships')
        .select('ticket_credits_remaining')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (creditsError) {
        console.error('Error fetching credits:', creditsError);
      }

      const totalCredits = membership?.ticket_credits_remaining || 0;

      // Simplified query for upcoming events - avoid complex joins that might fail
      const { data: userTickets, error: ticketsError } = await supabase
        .from('tickets')
        .select('order_id')
        .eq('user_id', user.id);

      if (ticketsError) {
        console.error('Error fetching tickets:', ticketsError);
      }

      let upcomingEventsCount = 0;
      if (userTickets && userTickets.length > 0) {
        const orderIds = userTickets.map((t: { order_id: string }) => t.order_id);
        const { data: orders, error: ordersEventsError } = await supabase
          .from('orders')
          .select('event_id, events!inner(start_date)')
          .in('id', orderIds)
          .gte('events.start_date', new Date().toISOString());

        if (ordersEventsError) {
          console.error('Error fetching upcoming events:', ordersEventsError);
        } else {
          upcomingEventsCount = orders?.length || 0;
        }
      }

      // Get referral count from referral_usage table
      const { count: referralsCount, error: referralsError } = await supabase
        .from('referral_usage')
        .select('*', { count: 'exact', head: true })
        .eq('referrer_user_id', user.id);

      if (referralsError) {
        console.error('Error fetching referrals:', referralsError);
      }

      setStats({
        orders: ordersCount || 0,
        credits: totalCredits,
        upcomingEvents: upcomingEventsCount,
        referrals: referralsCount || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <PortalLayout
      sidebar={<PortalSidebar />}
      title="Member Portal"
      description="Welcome back to GVTEWAY"
    >
      <div className={styles.container}>
        <div className={styles.statsGrid}>
          <StatCard label="Total Orders" value={stats.orders} icon={<Ticket />} />
          <StatCard label="Available Credits" value={stats.credits} icon={<Gift />} />
          <StatCard label="Upcoming Events" value={stats.upcomingEvents} icon={<Calendar />} />
          <StatCard label="Referrals" value={stats.referrals} icon={<TrendingUp />} />
        </div>

        <div className={styles.quickActions}>
          <Typography variant="h3" as="h2" className={styles.quickActionsTitle}>
            Quick Actions
          </Typography>
          <div className={styles.actionsGrid}>
            <Link href="/events" className={styles.actionLink}>
              Browse Events
            </Link>
            <Link href="/member/portal/orders" className={styles.actionLink}>
              My Orders
            </Link>
            <Link href="/member/portal/schedule" className={styles.actionLink}>
              My Schedule
            </Link>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
