import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { LoadingSpinner } from '@/design-system/components/atoms/LoadingSpinner';
import styles from './page.module.css';

async function EventLogistics({ eventId }: { eventId: string }) {
  const supabase = await createClient();
  
  const [schedulesResult, logisticsResult] = await Promise.all([
    supabase
      .from('production_schedules')
      .select('*')
      .eq('event_id', eventId)
      .order('schedule_date', { ascending: true })
      .order('start_time', { ascending: true }),
    supabase
      .from('event_logistics')
      .select('*')
      .eq('event_id', eventId)
      .single()
  ]);

  const schedules = schedulesResult.data || [];
  const logistics = logisticsResult.data;

  return (
    <div className={styles.content}>
      {logistics && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>LOAD IN/OUT</h3>
          <div className={styles.logisticsGrid}>
            {logistics.load_in_start && (
              <div className={styles.logisticsItem}>
                <span className={styles.label}>LOAD IN START</span>
                <span className={styles.value}>
                  {new Date(logistics.load_in_start).toLocaleString()}
                </span>
              </div>
            )}
            {logistics.load_in_end && (
              <div className={styles.logisticsItem}>
                <span className={styles.label}>LOAD IN END</span>
                <span className={styles.value}>
                  {new Date(logistics.load_in_end).toLocaleString()}
                </span>
              </div>
            )}
            {logistics.load_out_start && (
              <div className={styles.logisticsItem}>
                <span className={styles.label}>LOAD OUT START</span>
                <span className={styles.value}>
                  {new Date(logistics.load_out_start).toLocaleString()}
                </span>
              </div>
            )}
            {logistics.load_out_end && (
              <div className={styles.logisticsItem}>
                <span className={styles.label}>LOAD OUT END</span>
                <span className={styles.value}>
                  {new Date(logistics.load_out_end).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {schedules.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>PRODUCTION SCHEDULE ({schedules.length})</h3>
          <div className={styles.table}>
            <div className={styles.tableHeader}>
              <div className={styles.tableCell}>NAME</div>
              <div className={styles.tableCell}>TYPE</div>
              <div className={styles.tableCell}>DATE</div>
              <div className={styles.tableCell}>TIME</div>
              <div className={styles.tableCell}>STATUS</div>
            </div>
            {schedules.map((schedule: any) => (
              <div key={schedule.id} className={styles.tableRow}>
                <div className={styles.tableCell}>{schedule.schedule_name}</div>
                <div className={styles.tableCell}>
                  {schedule.schedule_type?.toUpperCase().replace('_', ' ') || '-'}
                </div>
                <div className={styles.tableCell}>
                  {new Date(schedule.schedule_date).toLocaleDateString()}
                </div>
                <div className={styles.tableCell}>
                  {schedule.start_time} - {schedule.end_time}
                </div>
                <div className={styles.tableCell}>
                  <span className={`${styles.status} ${styles[schedule.schedule_status]}`}>
                    {schedule.schedule_status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {schedules.length === 0 && !logistics && (
        <div className={styles.empty}>
          <p className={styles.emptyText}>NO LOGISTICS DATA</p>
        </div>
      )}
    </div>
  );
}

export default async function EventLogisticsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  
  const { data: event } = await supabase
    .from('events')
    .select('event_name')
    .eq('id', id)
    .single();

  if (!event) notFound();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>PRODUCTION LOGISTICS</h1>
      </div>

      <Suspense fallback={<LoadingSpinner />}>
        <EventLogistics eventId={id} />
      </Suspense>
    </div>
  );
}
