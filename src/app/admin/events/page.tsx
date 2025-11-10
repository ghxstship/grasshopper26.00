'use client';

import { AdminLayout } from '@/design-system/components/templates/AdminLayout/AdminLayout';
import { AdminSidebar } from '@/design-system/components/organisms/AdminSidebar/AdminSidebar';
import { Typography } from '@/design-system/components/atoms/Typography/Typography';
import { Button } from '@/design-system/components/atoms/Button/Button';
import { StatCard } from '@/design-system/components/molecules/StatCard/StatCard';
import { Input } from '@/design-system/components/atoms/Input/Input';
import { Calendar, Plus } from 'lucide-react';
import { useAdminEvents } from '@/hooks/useAdminEvents';
import Link from 'next/link';
import styles from './events.module.css';

export default function AdminEventsPage() {
  const { events, stats, loading, searchQuery, setSearchQuery } = useAdminEvents();

  return (
    <AdminLayout
      sidebar={<AdminSidebar />}
      title="Events Management"
      description="Manage all events and ticket inventory"
      actions={
        <Link href="/admin/events/create">
          <Button variant="filled">
            <Plus style={{ width: 20, height: 20 }} />
            Create Event
          </Button>
        </Link>
      }
    >
      <div className={styles.statsGrid}>
        <StatCard label="Total Events" value={loading ? '...' : stats.total} icon={<Calendar />} />
        <StatCard label="Upcoming" value={loading ? '...' : stats.upcoming} icon={<Calendar />} />
        <StatCard label="On Sale" value={loading ? '...' : stats.on_sale} icon={<Calendar />} />
      </div>

      <div className={styles.toolbar}>
        <Input
          type="search"
          placeholder="Search events..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className={styles.content}>
        {events && events.length > 0 ? (
          <div className={styles.eventsTable}>
            {events.map((event: any) => (
              <div key={event.id} className={styles.eventRow}>
                <Typography variant="body" as="div">{event.name}</Typography>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            <Typography variant="h3" as="p">No events found</Typography>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
