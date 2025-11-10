'use client';

import { AdminDashboardTemplate } from '@/design-system/components/templates';
import { Users, Ticket, DollarSign, TrendingUp, Calendar, Package } from 'lucide-react';
import { useAdminDashboard } from '@/hooks/useAdminDashboard';

export default function AdminDashboardPage() {
  const { stats, loading } = useAdminDashboard();

  return (
    <AdminDashboardTemplate
      title="Admin Dashboard"
      subtitle="Overview of platform metrics and activity"
      loading={loading}
      stats={[
        { label: 'Total Users', value: stats.total_users, icon: <Users />, trend: { value: 12, direction: 'up', label: '+12%' } },
        { label: 'Active Members', value: stats.active_members, icon: <TrendingUp />, trend: { value: 8, direction: 'up', label: '+8%' } },
        { label: 'Tickets Sold', value: stats.tickets_sold, icon: <Ticket />, trend: { value: 15, direction: 'up', label: '+15%' } },
        { label: 'Revenue', value: `$${stats.revenue.toLocaleString()}`, icon: <DollarSign />, trend: { value: 22, direction: 'up', label: '+22%' } },
      ]}
      quickActions={[
        { label: 'Create Event', icon: <Calendar />, href: '/admin/events/create' },
        { label: 'Manage Inventory', icon: <Package />, href: '/admin/inventory' },
      ]}
      tabs={[
        { key: 'overview', label: 'Overview', content: <div>Overview content</div> },
        { key: 'recent', label: 'Recent Activity', content: <div>Recent activity</div> },
      ]}
    />
  );
}
