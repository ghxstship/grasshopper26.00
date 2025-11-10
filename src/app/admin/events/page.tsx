'use client';

import { AdminListTemplate } from '@/design-system/components/templates';
import { Calendar, Plus } from 'lucide-react';
import { useAdminEvents } from '@/hooks/useAdminEvents';
import { EventsTable } from '@/design-system/components/organisms/admin/events-table';

export default function AdminEventsPage() {
  const { events, stats, loading, searchQuery, setSearchQuery, statusFilter, setStatusFilter } = useAdminEvents();

  return (
    <AdminListTemplate
      title="Events Management"
      subtitle="Manage all events and ticket inventory"
      loading={loading}
      stats={[
        { label: 'Total Events', value: stats.total },
        { label: 'Upcoming', value: stats.upcoming },
        { label: 'On Sale', value: stats.on_sale },
      ]}
      tabs={[
        { key: 'all', label: 'All Events', count: stats.total },
        { key: 'upcoming', label: 'Upcoming', count: stats.upcoming },
        { key: 'past', label: 'Past', count: stats.past },
      ]}
      activeTab={statusFilter}
      onTabChange={setStatusFilter}
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder="Search events..."
      primaryAction={{ label: 'Create Event', icon: <Plus />, href: '/admin/events/create' }}
      empty={{
        icon: <Calendar />,
        title: 'No events found',
        description: 'Create your first event to get started',
        action: { label: 'Create Event', href: '/admin/events/create' },
      }}
    >
      <EventsTable events={events} />
    </AdminListTemplate>
  );
}
