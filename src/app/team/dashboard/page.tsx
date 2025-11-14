'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { EventStaffGate } from '@/lib/rbac';
import { useAuth } from '@/hooks/use-auth';
import { DayOfShowLayout } from '@/design-system';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  Button, 
  Select, 
  Heading, 
  Text, 
  Stack, 
  Grid, 
  Spinner 
} from '@/design-system';
import Link from 'next/link';
import styles from './dashboard.module.css';

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
      
      if (!user?.id) {
        console.error('No user ID available');
        setLoading(false);
        return;
      }
      
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
        .eq('user_id', user.id)
        .is('removed_at', null)
        .gte('event.start_date', new Date().toISOString())
        .order('event.start_date', { ascending: true });

      if (error) {
        console.error('Error loading assignments:', error);
        throw error;
      }

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
      <div className={styles.loadingContainer}>
        <Stack gap={4} align="center">
          <Spinner size="lg" />
          <Text color="secondary">Loading dashboard...</Text>
        </Stack>
      </div>
    );
  }

  if (assignments.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <Card>
          <CardContent>
            <Stack gap={3} align="center">
              <Text as="div" size="3xl">📋</Text>
              <Heading level={2}>No Event Assignments</Heading>
              <Text color="secondary">You don&apos;t have any upcoming event assignments. Contact your event manager for access.</Text>
            </Stack>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentAssignment = assignments.find(a => a.event_id === selectedEvent);
  const currentEvent = currentAssignment?.event;

  return (
    <DayOfShowLayout
      header={
        <div className={styles.header}>
          <Stack gap={2}>
            <Heading level={1}>Event Staff Dashboard</Heading>
            <Text color="secondary">Welcome, {user?.email}</Text>
          </Stack>

          {assignments.length > 1 && (
            <div className={styles.eventSelector}>
              <Select
                options={assignments.map(assignment => ({
                  value: assignment.event_id,
                  label: assignment.event.title
                }))}
                value={selectedEvent || ''}
                onChange={(e) => setSelectedEvent(e.target.value)}
              />
            </div>
          )}
        </div>
      }
      liveMetrics={
        currentEvent && (
          <Card>
            <CardHeader>
              <CardTitle>{currentEvent.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <Stack gap={2}>
                <Text>📍 {currentEvent.venue_name}</Text>
                <Text>📅 {new Date(currentEvent.start_date).toLocaleDateString()}</Text>
                <Text>👥 Capacity: {currentEvent.capacity?.toLocaleString()}</Text>
              </Stack>
            </CardContent>
          </Card>
        )
      }
      capacityMonitors={
        stats && (
          <Card>
            <CardHeader>
              <div className={styles.cardHeaderRow}>
                <CardTitle>Live Capacity</CardTitle>
                <Button variant="secondary" size="sm" onClick={refreshStats}>
                  🔄 Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Stack gap={4}>
                <div className={styles.progressContainer}>
                  <div className={styles.progressInfo}>
                    <Text weight="bold">Checked In</Text>
                    <Text weight="bold">
                      {stats.checkedIn} / {stats.totalCapacity}
                    </Text>
                  </div>
                  <div className={styles.progressBar}>
                    <div 
                      className={styles.progressBarFill}
                      data-percent={Math.min(stats.percentFull, 100)}
                      style={{ '--progress-width': `${Math.min(stats.percentFull, 100)}%` } as React.CSSProperties}
                    />
                  </div>
                  <Text size="sm" color="secondary">
                    {stats.percentFull.toFixed(1)}% full
                  </Text>
                </div>

                <Grid columns={2} gap={4}>
                  <div className={styles.statCard}>
                    <Text size="3xl" weight="bold">{stats.checkedIn}</Text>
                    <Text size="sm" color="secondary">Checked In</Text>
                  </div>
                  <div className={styles.statCard}>
                    <Text size="3xl" weight="bold">{stats.remaining}</Text>
                    <Text size="sm" color="secondary">Remaining</Text>
                  </div>
                </Grid>

                {stats.percentFull >= 90 && (
                  <Card>
                    <CardContent>
                      <Stack gap={1}>
                        <Text weight="bold">⚠️ Near Capacity</Text>
                        <Text size="sm">Prepare for capacity management protocols</Text>
                      </Stack>
                    </CardContent>
                  </Card>
                )}
              </Stack>
            </CardContent>
          </Card>
        )
      }
      checkInSystem={
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <Grid columns={2} gap={3}>
              <Link href={`/team/scanner?eventId=${selectedEvent}`} className={styles.actionLink}>
                <Button variant="primary" fullWidth>
                  📱 Scan Tickets
                </Button>
              </Link>
              <Button variant="secondary" onClick={refreshStats} fullWidth>
                📊 View Stats
              </Button>
              <Link href={`/team/issues?eventId=${selectedEvent}`} className={styles.actionLink}>
                <Button variant="secondary" fullWidth>
                  ⚠️ Report Issue
                </Button>
              </Link>
              <Link href={`/team/notes?eventId=${selectedEvent}`} className={styles.actionLink}>
                <Button variant="secondary" fullWidth>
                  📝 Quick Notes
                </Button>
              </Link>
            </Grid>
          </CardContent>
        </Card>
      }
      staffStatus={
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <Stack gap={3}>
              <div className={styles.activityItem}>
                <Text as="span">✓</Text>
                <Stack gap={1}>
                  <Text weight="bold">Ticket scanned</Text>
                  <Text size="sm" color="secondary">2 minutes ago</Text>
                </Stack>
              </div>
              <div className={styles.activityItem}>
                <Text as="span">ℹ️</Text>
                <Stack gap={1}>
                  <Text weight="bold">Shift started</Text>
                  <Text size="sm" color="secondary">1 hour ago</Text>
                </Stack>
              </div>
            </Stack>
          </CardContent>
        </Card>
      }
      footer={
        <Card>
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <Stack gap={2}>
              <Button variant="secondary" fullWidth>
                📞 Contact Event Manager
              </Button>
              <Button variant="secondary" fullWidth>
                📖 View Staff Guide
              </Button>
              <Button variant="secondary" fullWidth>
                🆘 Emergency Protocols
              </Button>
            </Stack>
          </CardContent>
        </Card>
      }
    />
  );
}
