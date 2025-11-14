'use client';

import { Button, Input, Heading, Text } from '@/design-system';
import { StatCard } from '@/design-system';
import { AdminTemplate } from '@/design-system';
import { Calendar, Plus } from 'lucide-react';
import { useAdminEvents } from '@/hooks/useAdminEvents';
import Link from 'next/link';
import styles from './events.module.css';

export default function AdminEventsPage() {
  const { events, stats, loading, searchQuery, setSearchQuery } = useAdminEvents();

  return (
    <AdminTemplate
      title="Events Management"
      description="Manage all events and ticket inventory"
      actions={
        <Link href="/admin/events/create">
          <Button variant="primary">
            <Plus className={styles.icon} />
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
                <Text>{event.name}</Text>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            <Heading level={3} font="bebas">No events found</Heading>
          </div>
        )}
      </div>
    </AdminTemplate>
  );
}
