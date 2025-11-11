'use client';

import { AdminLayout } from '@/design-system/components/templates/AdminLayout/AdminLayout';
import { AdminSidebar } from '@/design-system/components/organisms/AdminSidebar/AdminSidebar';
import { Typography } from '@/design-system/components/atoms/Typography/Typography';
import { StatCard } from '@/design-system/components/molecules/StatCard/StatCard';
import { Skeleton } from '@/design-system/components/atoms/Skeleton/Skeleton';
import { ActivityFeed } from '@/design-system/components/organisms/ActivityFeed/ActivityFeed';
import { DataTable } from '@/design-system/components/organisms/DataTable/DataTable';
import { Users, Ticket, DollarSign, TrendingUp } from 'lucide-react';
import { useAdminDashboard } from '@/hooks/useAdminDashboard';
import styles from './dashboard.module.css';

export default function AdminDashboardPage() {
  const { stats, loading } = useAdminDashboard();

  return (
    <AdminLayout
      sidebar={<AdminSidebar />}
      title="Admin Dashboard"
      description="Overview of platform metrics and activity"
    >
      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="rectangular" height="120px" />
          ))
        ) : (
          <>
            <StatCard
              label="Total Users"
              value={stats?.total_users || 0}
              icon={<Users />}
            />
            <StatCard
              label="Active Members"
              value={stats?.active_members || 0}
              icon={<TrendingUp />}
            />
            <StatCard
              label="Tickets Sold"
              value={stats?.tickets_sold || 0}
              icon={<Ticket />}
            />
            <StatCard
              label="Revenue"
              value={`$${stats?.revenue?.toLocaleString() || 0}`}
              icon={<DollarSign />}
            />
          </>
        )}
      </div>

    </AdminLayout>
  );
}
