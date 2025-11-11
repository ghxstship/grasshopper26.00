'use client';

import { PortalLayout } from '@/design-system/components/templates/PortalLayout/PortalLayout';
import { PortalSidebar } from '@/design-system/components/organisms/PortalSidebar/PortalSidebar';
import { Typography } from '@/design-system/components/atoms/Typography/Typography';
import { StatCard } from '@/design-system/components/molecules/StatCard/StatCard';
import { Ticket, Gift, Calendar, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

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
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { count: ordersCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      const { data: credits } = await supabase
        .from('user_credits')
        .select('amount')
        .eq('user_id', user.id)
        .is('used', false);

      const totalCredits = credits?.reduce((sum: number, c: any) => sum + (c.amount || 0), 0) || 0;

      const { count: eventsCount } = await supabase
        .from('tickets')
        .select('*, orders!inner(event_id, events!inner(start_date))', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('orders.events.start_date', new Date().toISOString());

      const { count: referralsCount } = await supabase
        .from('referrals')
        .select('*', { count: 'exact', head: true })
        .eq('referrer_id', user.id);

      setStats({
        orders: ordersCount || 0,
        credits: totalCredits,
        upcomingEvents: eventsCount || 0,
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
      <div style={{ display: 'grid', gap: 'var(--space-6)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
          <StatCard label="Total Orders" value={stats.orders} icon={<Ticket />} />
          <StatCard label="Available Credits" value={stats.credits} icon={<Gift />} />
          <StatCard label="Upcoming Events" value={stats.upcomingEvents} icon={<Calendar />} />
          <StatCard label="Referrals" value={stats.referrals} icon={<TrendingUp />} />
        </div>

        <div style={{ padding: 'var(--space-6)', border: 'var(--border-width-thick) solid var(--color-border-strong)', backgroundColor: 'var(--color-bg-secondary)' }}>
          <Typography variant="h3" as="h2">Quick Actions</Typography>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
            <Link href="/events" style={{ padding: 'var(--space-4)', border: 'var(--border-width-thick) solid var(--color-border-default)', textAlign: 'center', textDecoration: 'none', color: 'var(--color-text-primary)' }}>Browse Events</Link>
            <Link href="/member/portal/orders" style={{ padding: 'var(--space-4)', border: 'var(--border-width-thick) solid var(--color-border-default)', textAlign: 'center', textDecoration: 'none', color: 'var(--color-text-primary)' }}>My Orders</Link>
            <Link href="/member/portal/schedule" style={{ padding: 'var(--space-4)', border: 'var(--border-width-thick) solid var(--color-border-default)', textAlign: 'center', textDecoration: 'none', color: 'var(--color-text-primary)' }}>My Schedule</Link>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
