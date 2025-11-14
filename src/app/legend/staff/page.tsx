import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { Spinner } from '@/design-system';
import styles from './page.module.css';

export const metadata = {
  title: 'Staff Assignments | GVTEWAY',
};

async function StaffList() {
  const supabase = await createClient();
  
  const { data: assignments, error } = await supabase
    .from('staff_assignments')
    .select(`
      *,
      event:events(event_name),
      position:staff_positions(position_name)
    `)
    .order('scheduled_start', { ascending: true });

  if (error) {
    console.error('Error fetching staff assignments:', error);
    return (
      <div className={styles.empty}>
        <p className={styles.emptyText}>ERROR LOADING STAFF ASSIGNMENTS</p>
        <p className={styles.emptyText}>{error.message}</p>
      </div>
    );
  }

  if (!assignments || assignments.length === 0) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyText}>NO STAFF ASSIGNMENTS</p>
      </div>
    );
  }

  const upcomingAssignments = assignments.filter((a: any) => 
    new Date(a.scheduled_start) >= new Date() && 
    ['scheduled', 'confirmed'].includes(a.assignment_status)
  );

  return (
    <div className={styles.table}>
      <div className={styles.tableHeader}>
        <div className={styles.tableCell}>EVENT</div>
        <div className={styles.tableCell}>POSITION</div>
        <div className={styles.tableCell}>START</div>
        <div className={styles.tableCell}>END</div>
        <div className={styles.tableCell}>STATUS</div>
      </div>
      {upcomingAssignments.map((assignment: any) => (
        <div key={assignment.id} className={styles.tableRow}>
          <div className={styles.tableCell}>{assignment.event?.event_name || '-'}</div>
          <div className={styles.tableCell}>{assignment.position?.position_name || '-'}</div>
          <div className={styles.tableCell}>
            {new Date(assignment.scheduled_start).toLocaleString()}
          </div>
          <div className={styles.tableCell}>
            {new Date(assignment.scheduled_end).toLocaleString()}
          </div>
          <div className={styles.tableCell}>
            <span className={`${styles.status} ${styles[assignment.assignment_status]}`}>
              {assignment.assignment_status.toUpperCase().replace('_', ' ')}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function StaffPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>STAFF ASSIGNMENTS</h1>
      </div>

      <Suspense fallback={<Spinner />}>
        <StaffList />
      </Suspense>
    </div>
  );
}
