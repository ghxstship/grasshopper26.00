import { Suspense } from 'react';
import { getStaffAssignments, getStaffStats } from '@/lib/actions/staff';
import { StaffStatusBadge } from '@/design-system/components/atoms/StaffStatusBadge';
import { EventDashboardCard } from '@/design-system/components/molecules/EventDashboardCard';
import { LoadingSpinner } from '@/design-system/components/atoms/LoadingSpinner';
import styles from './page.module.css';

export const metadata = {
  title: 'Staff Management | GVTEWAY',
  description: 'Manage event staff',
};

interface StaffPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function StaffList({ eventId }: { eventId: string }) {
  const [assignments, stats] = await Promise.all([
    getStaffAssignments(eventId),
    getStaffStats(eventId),
  ]);

  if (!assignments || assignments.length === 0) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyText}>NO STAFF ASSIGNED</p>
      </div>
    );
  }

  return (
    <div className={styles.content}>
      {stats && (
        <div className={styles.statsGrid}>
          <EventDashboardCard
            title="TOTAL STAFF"
            value={stats.totalAssignments}
          />
          <EventDashboardCard
            title="CHECKED IN"
            value={stats.checkedIn}
          />
          <EventDashboardCard
            title="CHECKED OUT"
            value={stats.checkedOut}
          />
          <EventDashboardCard
            title="LABOR COST"
            value={`$${stats.totalCost.toLocaleString()}`}
          />
        </div>
      )}

      <div className={styles.table}>
        <div className={styles.tableHeader}>
          <div className={styles.tableCell}>POSITION</div>
          <div className={styles.tableCell}>SCHEDULED</div>
          <div className={styles.tableCell}>LOCATION</div>
          <div className={styles.tableCell}>RATE</div>
          <div className={styles.tableCell}>STATUS</div>
        </div>
        {assignments.map((assignment: any) => {
          const scheduledStart = new Date(assignment.scheduled_start);
          const scheduledEnd = new Date(assignment.scheduled_end);
          
          return (
            <div key={assignment.id} className={styles.tableRow}>
              <div className={styles.tableCell}>
                <span className={styles.positionName}>
                  {assignment.position?.position_name || 'N/A'}
                </span>
              </div>
              <div className={styles.tableCell}>
                <div className={styles.timeRange}>
                  <span>{scheduledStart.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                  <span className={styles.timeSeparator}>→</span>
                  <span>{scheduledEnd.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                </div>
              </div>
              <div className={styles.tableCell}>
                {assignment.assigned_location || '-'}
              </div>
              <div className={styles.tableCell}>
                {assignment.hourly_rate ? `$${assignment.hourly_rate}/hr` : '-'}
              </div>
              <div className={styles.tableCell}>
                <StaffStatusBadge status={assignment.assignment_status} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default async function StaffPage({ params }: StaffPageProps) {
  const { id } = await params;
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>STAFF MANAGEMENT</h1>
      </div>

      <Suspense fallback={<LoadingSpinner />}>
        <StaffList eventId={id} />
      </Suspense>
    </div>
  );
}
