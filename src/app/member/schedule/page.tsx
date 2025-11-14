'use client';

import { PageTemplate } from '@/design-system';
import { Calendar } from 'lucide-react';
import { useSchedule } from '@/hooks/useSchedule';
import { ScheduleList } from '@/design-system';
import styles from './schedule.module.css';

export default function SchedulePage() {
  const { events, loading } = useSchedule();

  return (
    <PageTemplate showHeader showFooter>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>My Schedule</h1>
          <p className={styles.subtitle}>Your upcoming events</p>
        </header>
        {loading ? (
          <div className={styles.loading}>Loading...</div>
        ) : events.length > 0 ? (
          <ScheduleList events={events} />
        ) : (
          <div className={styles.empty}>
            <Calendar className={styles.emptyIcon} />
            <h2 className={styles.emptyTitle}>No events scheduled</h2>
            <p className={styles.emptyText}>Get tickets to see events here</p>
            <button 
              className={styles.button}
              onClick={() => window.location.href = '/events'}
            >
              Browse Events
            </button>
          </div>
        )}
      </div>
    </PageTemplate>
  );
}
