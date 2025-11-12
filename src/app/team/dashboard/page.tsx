'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { EventStaffGate } from '@/lib/rbac';
import { useAuth } from '@/hooks/use-auth';
import { DayOfShowLayout } from '@/design-system/components/templates/DayOfShowLayout/DayOfShowLayout';
import Link from 'next/link';
import styles from './page.module.css';

interface EventAssignment {
  id: string;
  event_id: string;
  event_role_type: string;
  event: {
    id: string;
    title: string;
    start_date: string;
    venue_name: string;
    capacity: number;
  };
}

interface EventStats {
  totalCapacity: number;
  checkedIn: number;
  remaining: number;
  percentFull: number;
}

export default function StaffDashboardPage() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<EventAssignment[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [stats, setStats] = useState<EventStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (user) {
      loadAssignments();
    }
  }, [user]);

  useEffect(() => {
    if (selectedEvent) {
      loadEventStats();
    }
  }, [selectedEvent, refreshKey]);

  async function loadAssignments() {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('event_team_assignments')
        .select(`
          id,
          event_id,
          event_role_type,
          event:events!inner(
            id,
            title,
            start_date,
            venue_name,
            capacity
          )
        `)
        .eq('user_id', user?.id)
        .is('removed_at', null)
        .gte('event.start_date', new Date().toISOString())
        .order('event.start_date', { ascending: true });

      if (error) throw error;

      setAssignments(data as any || []);
      
      // Auto-select first event
      if (data && data.length > 0 && !selectedEvent) {
        setSelectedEvent(data[0].event_id);
      }
    } catch (error) {
      console.error('Error loading assignments:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadEventStats() {
    if (!selectedEvent) return;

    try {
      const supabase = createClient();

      // Get event details
      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('capacity')
        .eq('id', selectedEvent)
        .single();

      if (eventError) throw eventError;

      // Get checked-in count
      const { data: tickets, error: ticketsError } = await supabase
        .from('tickets')
        .select('id, checked_in_at, orders!inner(event_id)')
        .eq('orders.event_id', selectedEvent)
        .eq('status', 'active');

      if (ticketsError) throw ticketsError;

      const checkedIn = tickets?.filter((t: any) => t.checked_in_at).length || 0;
      const totalCapacity = event.capacity || 0;
      const remaining = totalCapacity - checkedIn;
      const percentFull = totalCapacity > 0 ? (checkedIn / totalCapacity) * 100 : 0;

      setStats({
        totalCapacity,
        checkedIn,
        remaining,
        percentFull,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }

  function refreshStats() {
    setRefreshKey(prev => prev + 1);
  }

  if (loading) {
    return (
      <div className={styles.row}>
        <div className={styles.section}>
          <div className={styles.spinner}></div>
          <p className={styles.subtitle}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (assignments.length === 0) {
    return (
      <div className={styles.row}>
        <div className={styles.emptyState}>
          <div className={styles.emoji}>📋</div>
          <h2 className={styles.title}>No Event Assignments</h2>
          <p className={styles.subtitle}>You don&apos;t have any upcoming event assignments. Contact your event manager for access.</p>
        </div>
      </div>
    );
  }

  const currentAssignment = assignments.find(a => a.event_id === selectedEvent);
  const currentEvent = currentAssignment?.event;

  return (
    <DayOfShowLayout
      header={
        <div className={styles.stickyHeader}>
          <div className={styles.section}>
            <h1 className={styles.pageTitle}>Event Staff Dashboard</h1>
            <p className={styles.subtitle}>Welcome, {user?.email}</p>
          </div>

          {assignments.length > 1 && (
            <div className={styles.selectorContainer}>
              <select
                value={selectedEvent || ''}
                onChange={(e) => setSelectedEvent(e.target.value)}
                className={styles.select}
              >
                {assignments.map(assignment => (
                  <option key={assignment.id} value={assignment.event_id}>
                    {assignment.event.title}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      }
      liveMetrics={
        currentEvent && (
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>{currentEvent.title}</h2>
            <div className={styles.section}>
              <p className={styles.infoText}>📍 {currentEvent.venue_name}</p>
              <p className={styles.infoText}>📅 {new Date(currentEvent.start_date).toLocaleDateString()}</p>
              <p className={styles.infoText}>👥 Capacity: {currentEvent.capacity?.toLocaleString()}</p>
            </div>
          </div>
        )
      }
      capacityMonitors={
        stats && (
          <div className={styles.statsCard}>
            <div className={styles.header}>
              <h3 className={styles.cardTitle}>Live Capacity</h3>
              <button onClick={refreshStats} className={styles.refreshButton}>
                🔄 Refresh
              </button>
            </div>

            <div className={styles.progressSection}>
              <div className={styles.progressHeader}>
                <span className={styles.progressLabel}>Checked In</span>
                <span className={styles.progressValue}>
                  {stats.checkedIn} / {stats.totalCapacity}
                </span>
              </div>
              <div className={styles.progressBarBg}>
                <div
                  className={styles.progressBarFill}
                  style={{ width: `${Math.min(stats.percentFull, 100)}%` }}
                />
              </div>
              <p className={styles.progressPercent}>
                {stats.percentFull.toFixed(1)}% full
              </p>
            </div>

            <div className={styles.grid}>
              <div className={styles.statBox}>
                <p className={styles.statValue}>{stats.checkedIn}</p>
                <p className={styles.statLabel}>Checked In</p>
              </div>
              <div className={styles.statBox}>
                <p className={styles.statValue}>{stats.remaining}</p>
                <p className={styles.statLabel}>Remaining</p>
              </div>
            </div>

            {stats.percentFull >= 90 && (
              <div className={styles.warningBox}>
                <p className={styles.warningTitle}>⚠️ Near Capacity</p>
                <p className={styles.warningText}>Prepare for capacity management protocols</p>
              </div>
            )}
          </div>
        )
      }
      checkInSystem={
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Quick Actions</h3>
          <div className={styles.grid}>
            <Link href={`/team/scanner?eventId=${selectedEvent}`} className={styles.actionButton}>
              <span className={styles.actionIcon}>📱</span>
              <span className={styles.actionLabel}>Scan Tickets</span>
            </Link>
            <button onClick={refreshStats} className={styles.actionButton}>
              <span className={styles.actionIcon}>📊</span>
              <span className={styles.actionLabel}>View Stats</span>
            </button>
            <Link href={`/team/issues?eventId=${selectedEvent}`} className={styles.actionButton}>
              <span className={styles.actionIcon}>⚠️</span>
              <span className={styles.actionLabel}>Report Issue</span>
            </Link>
            <Link href={`/team/notes?eventId=${selectedEvent}`} className={styles.actionButton}>
              <span className={styles.actionIcon}>📝</span>
              <span className={styles.actionLabel}>Quick Notes</span>
            </Link>
          </div>
        </div>
      }
      staffStatus={
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Recent Activity</h3>
          <div className={styles.section}>
            <div className={styles.activityItem}>
              <span className={styles.activityIcon}>✓</span>
              <div className={styles.activityContent}>
                <p className={styles.activityTitle}>Ticket scanned</p>
                <p className={styles.activityTime}>2 minutes ago</p>
              </div>
            </div>
            <div className={styles.activityItem}>
              <span className={styles.activityIcon}>ℹ️</span>
              <div className={styles.activityContent}>
                <p className={styles.activityTitle}>Shift started</p>
                <p className={styles.activityTime}>1 hour ago</p>
              </div>
            </div>
          </div>
        </div>
      }
      footer={
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Need Help?</h3>
          <div className={styles.section}>
            <button className={styles.helpButton}>📞 Contact Event Manager</button>
            <button className={styles.helpButton}>📖 View Staff Guide</button>
            <button className={styles.helpButton}>🆘 Emergency Protocols</button>
          </div>
        </div>
      }
    />
  );
}
