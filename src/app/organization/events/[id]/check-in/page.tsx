/**
 * Event Check-In Dashboard
 * Real-time ticket scanning and attendee check-in interface for event staff
 */

'use client';

import { use, useState, useEffect } from 'react';
import { ContextualPageTemplate } from '@/design-system/components/templates';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/design-system/components/atoms/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/components/atoms/Card';
import { Input } from '@/design-system/components/atoms/Input';
import { Badge } from '@/design-system/components/atoms/Badge';
import { QrCode, Search, Users, CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { QRScanner } from '@/design-system/components/organisms/event-roles/QRScanner';
import styles from './check-in-content.module.css';

interface CheckInStats {
  total_capacity: number;
  checked_in: number;
  remaining: number;
  percentage: number;
}

interface Ticket {
  id: string;
  ticket_number: string;
  ticket_type: string;
  attendee_name: string;
  attendee_email: string;
  checked_in: boolean;
  checked_in_at: string | null;
  checked_in_by: string | null;
}

export default function EventCheckInPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const supabase = createClient();
  
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<any>(null);
  const [stats, setStats] = useState<CheckInStats>({
    total_capacity: 0,
    checked_in: 0,
    remaining: 0,
    percentage: 0,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Ticket[]>([]);
  const [recentCheckIns, setRecentCheckIns] = useState<Ticket[]>([]);
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    loadEventData();
    loadStats();
    loadRecentCheckIns();
    
    const channel = supabase
      .channel(`event-${id}-checkins`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'tickets',
        filter: `event_id=eq.${id}`,
      }, () => {
        loadStats();
        loadRecentCheckIns();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const loadEventData = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setEvent(data);
    } catch (error: any) {
      toast.error('Failed to load event data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const { count: totalCount } = await supabase
        .from('tickets')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', id);

      const { count: checkedInCount } = await supabase
        .from('tickets')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', id)
        .eq('checked_in', true);

      const total = totalCount || 0;
      const checkedIn = checkedInCount || 0;
      const remaining = total - checkedIn;
      const percentage = total > 0 ? (checkedIn / total) * 100 : 0;

      setStats({
        total_capacity: total,
        checked_in: checkedIn,
        remaining,
        percentage,
      });
    } catch (error: any) {
      console.error('Failed to load stats:', error);
    }
  };

  const loadRecentCheckIns = async () => {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('event_id', id)
        .eq('checked_in', true)
        .order('checked_in_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setRecentCheckIns(data || []);
    } catch (error: any) {
      console.error('Failed to load recent check-ins:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('event_id', id)
        .or(`ticket_number.ilike.%${searchQuery}%,attendee_name.ilike.%${searchQuery}%,attendee_email.ilike.%${searchQuery}%`)
        .limit(10);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error: any) {
      toast.error('Search failed');
      console.error(error);
    }
  };

  const handleCheckIn = async (ticketId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('tickets')
        .update({
          checked_in: true,
          checked_in_at: new Date().toISOString(),
          checked_in_by: user.id,
        })
        .eq('id', ticketId);

      if (error) throw error;

      toast.success('Ticket checked in successfully');
      handleSearch();
      loadStats();
      loadRecentCheckIns();
    } catch (error: any) {
      toast.error('Check-in failed: ' + error.message);
      console.error(error);
    }
  };

  const handleUndoCheckIn = async (ticketId: string) => {
    try {
      const { error } = await supabase
        .from('tickets')
        .update({
          checked_in: false,
          checked_in_at: null,
          checked_in_by: null,
        })
        .eq('id', ticketId);

      if (error) throw error;

      toast.success('Check-in undone');
      handleSearch();
      loadStats();
      loadRecentCheckIns();
    } catch (error: any) {
      toast.error('Failed to undo check-in');
      console.error(error);
    }
  };

  return (
    <ContextualPageTemplate
      breadcrumbs={[
        { label: 'Events', href: '/admin/events' },
        { label: event?.name || 'Event', href: `/admin/events/${id}` },
        { label: 'Check-In', href: `/admin/events/${id}/check-in` }
      ]}
      title="Event Check-In"
      subtitle={event?.name ? `${event.name} - Real-time attendee check-in` : 'Real-time attendee check-in'}
      primaryAction={{
        label: showScanner ? 'Close Scanner' : 'Open QR Scanner',
        onClick: () => setShowScanner(!showScanner),
        icon: <QrCode />
      }}
      loading={loading}
    >
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total Tickets</span>
          <span className={styles.statValue}>{stats.total_capacity}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Checked In</span>
          <span className={styles.statValue}>{stats.checked_in}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Remaining</span>
          <span className={styles.statValue}>{stats.remaining}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Progress</span>
          <span className={styles.statValue}>{Math.round(stats.percentage)}%</span>
        </div>
      </div>

      {showScanner && (
            <Card>
              <CardHeader>
                <CardTitle>QR Code Scanner</CardTitle>
              </CardHeader>
              <CardContent>
                <QRScanner
                  eventId={id}
                  onScan={(ticketNumber) => {
                    handleSearch();
                  }}
                />
              </CardContent>
            </Card>
      )}

      <Card>
              <CardHeader>
                <CardTitle>Search Tickets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={styles.searchWrapper}>
                  <Search className={styles.searchIcon} />
                  <Input
                    placeholder="Search by ticket number, name, or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className={styles.searchInput}
                  />
                  <Button onClick={handleSearch}>Search</Button>
                </div>

                {searchResults.length > 0 && (
                  <div className={styles.resultsList}>
                    {searchResults.map((ticket) => (
                      <div key={ticket.id} className={styles.ticketItem}>
                        <div className={styles.ticketInfo}>
                          <h4 className={styles.ticketName}>{ticket.attendee_name}</h4>
                          <p className={styles.ticketDetails}>
                            {ticket.ticket_number} • {ticket.ticket_type}
                          </p>
                          <p className={styles.ticketEmail}>{ticket.attendee_email}</p>
                        </div>
                        <div className={styles.ticketActions}>
                          {ticket.checked_in ? (
                            <>
                              <Badge variant="default">
                                <CheckCircle className={styles.iconSmall} />
                                Checked In
                              </Badge>
                              <Button
                                variant="outlined"
                                size="sm"
                                onClick={() => handleUndoCheckIn(ticket.id)}
                              >
                                Undo
                              </Button>
                            </>
                          ) : (
                            <Button onClick={() => handleCheckIn(ticket.id)}>
                              Check In
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

      <Card>
              <CardHeader>
                <CardTitle>Recent Check-Ins</CardTitle>
              </CardHeader>
              <CardContent>
                {recentCheckIns.length === 0 ? (
                  <p className={styles.emptyText}>No check-ins yet</p>
                ) : (
                  <div className={styles.recentList}>
                    {recentCheckIns.map((ticket) => (
                      <div key={ticket.id} className={styles.recentItem}>
                        <div className={styles.recentInfo}>
                          <p className={styles.recentName}>{ticket.attendee_name}</p>
                          <p className={styles.recentDetails}>
                            {ticket.ticket_type} • {new Date(ticket.checked_in_at!).toLocaleTimeString()}
                          </p>
                        </div>
                        <CheckCircle className={styles.iconSuccess} />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
    </ContextualPageTemplate>
  );
}
