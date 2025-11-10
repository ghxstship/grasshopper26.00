'use client';

import { AdminLayout } from '@/design-system/components/templates/AdminLayout/AdminLayout';
import { AdminSidebar } from '@/design-system/components/organisms/AdminSidebar/AdminSidebar';
import { Typography } from '@/design-system/components/atoms/Typography/Typography';
import { StatCard } from '@/design-system/components/molecules/StatCard/StatCard';
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
      <div className={styles.statsGrid}>
        <StatCard
          label="Total Users"
          value={loading ? '...' : stats.total_users}
          icon={<Users />}
        />
        <StatCard
          label="Active Members"
          value={loading ? '...' : stats.active_members}
          icon={<TrendingUp />}
        />
        <StatCard
          label="Tickets Sold"
          value={loading ? '...' : stats.tickets_sold}
          icon={<Ticket />}
        />
        <StatCard
          label="Revenue"
          value={loading ? '...' : `$${stats.revenue?.toLocaleString() || 0}`}
          icon={<DollarSign />}
        />
      </div>

      <div className={styles.content}>
        <Typography variant="h3" as="h2">
          Recent Activity
        </Typography>
      </div>
    </AdminLayout>
  );
}
