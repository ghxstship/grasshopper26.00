/**
 * Organization Dashboard Client
 * GHXSTSHIP Atomic Design System
 */

'use client';

import { Stack, Grid, Button } from '@/design-system';
import { StatCard } from '@/design-system';
import { AdminTemplate } from '@/design-system';

interface DashboardStats {
  totalEvents: number;
  totalRevenue: number;
  totalOrders: number;
  activeUsers: number;
}

interface DashboardClientProps {
  stats: DashboardStats;
}

export function DashboardClient({ stats }: DashboardClientProps) {
  return (
    <AdminTemplate
      title="Dashboard"
      description="Organization overview and analytics"
      actions={
        <Button variant="primary" onClick={() => window.location.href = '/organization/events/new'}>
          Create Event
        </Button>
      }
    >
      <Stack gap={8}>
        <Grid columns={4} gap={6} responsive>
          <StatCard
            label="Total Events"
            value={stats.totalEvents}
          />
          <StatCard
            label="Total Revenue"
            value={`$${stats.totalRevenue.toLocaleString()}`}
          />
          <StatCard
            label="Total Orders"
            value={stats.totalOrders}
          />
          <StatCard
            label="Active Users"
            value={stats.activeUsers}
          />
        </Grid>
      </Stack>
    </AdminTemplate>
  );
}
