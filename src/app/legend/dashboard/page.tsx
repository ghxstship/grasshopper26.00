'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { StatCard } from '@/design-system/components/molecules/StatCard/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/components/atoms/Card';
import Link from 'next/link';
import { 
  Building2, 
  MapPin, 
  Users, 
  Calendar,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import styles from './page.module.css';

export default function LegendDashboardPage() {
  const [stats, setStats] = useState({
    totalOrganizations: 0,
    totalVenues: 0,
    totalStaff: 0,
    totalEvents: 0,
    totalRevenue: 0,
    activeOrganizations: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const supabase = createClient();

      // Get organization count
      const { count: orgCount } = await supabase
        .from('organizations')
        .select('*', { count: 'exact', head: true });

      // Get venue count
      const { count: venueCount } = await supabase
        .from('venues')
        .select('*', { count: 'exact', head: true });

      // Get staff count
      const { count: staffCount } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true });

      // Get event count
      const { count: eventCount } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true });

      // Get total revenue
      const { data: revenueData } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('status', 'completed');

      const totalRevenue = revenueData?.reduce((sum: number, order: any) => sum + (order.total_amount || 0), 0) || 0;

      // Get active organizations (with recent events)
      const { count: activeOrgCount } = await supabase
        .from('organizations')
        .select('*, events!inner(*)', { count: 'exact', head: true })
        .gte('events.start_date', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString());

      setStats({
        totalOrganizations: orgCount || 0,
        totalVenues: venueCount || 0,
        totalStaff: staffCount || 0,
        totalEvents: eventCount || 0,
        totalRevenue,
        activeOrganizations: activeOrgCount || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p className={styles.loadingText}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Platform Overview</h1>
        <p className={styles.subtitle}>GVTEWAY Legend Dashboard</p>
      </div>

      <div className={styles.statsGrid}>
        <StatCard
          label="Organizations"
          value={stats.totalOrganizations}
          icon={<Building2 />}
        />
        <StatCard
          label="Venues"
          value={stats.totalVenues}
          icon={<MapPin />}
        />
        <StatCard
          label="Total Staff"
          value={stats.totalStaff}
          icon={<Users />}
        />
        <StatCard
          label="Events"
          value={stats.totalEvents}
          icon={<Calendar />}
        />
        <StatCard
          label="Total Revenue"
          value={`$${(stats.totalRevenue / 100).toLocaleString()}`}
          icon={<DollarSign />}
        />
        <StatCard
          label="Platform Health"
          value="Operational"
          icon={<TrendingUp />}
        />
      </div>

      <div className={styles.quickActions}>
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={styles.actionGrid}>
              <Link href="/legend/organizations" className={styles.actionButton}>
                <Building2 size={24} />
                <span>Manage Organizations</span>
              </Link>
              <Link href="/legend/venues" className={styles.actionButton}>
                <MapPin size={24} />
                <span>Manage Venues</span>
              </Link>
              <Link href="/legend/staff" className={styles.actionButton}>
                <Users size={24} />
                <span>Manage Staff</span>
              </Link>
              <Link href="/legend/vendors" className={styles.actionButton}>
                <Calendar size={24} />
                <span>Manage Vendors</span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
