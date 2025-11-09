/**
 * Event Check-In Dashboard
 * Real-time ticket scanning and attendee check-in interface for event staff
 */

'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/design-system/components/atoms/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/components/atoms/card';
import { Input } from '@/design-system/components/atoms/input';
import { Badge } from '@/design-system/components/atoms/badge';
import { ArrowLeft, QrCode, Search, Users, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { QRScanner } from '@/components/event-roles/QRScanner';

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
  const router = useRouter();
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
    
    // Set up real-time subscription for check-ins
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
      // Get total tickets
      const { count: totalCount } = await supabase
        .from('tickets')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', id);

      // Get checked-in tickets
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
      handleSearch(); // Refresh search results
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

  const handleQRScan = async (qrData: string) => {
    try {
      // QR data should be the ticket number or ticket ID
      const { data: tickets, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('event_id', id)
        .or(`ticket_number.eq.${qrData},id.eq.${qrData}`)
        .limit(1);

      if (error) throw error;

      if (!tickets || tickets.length === 0) {
        toast.error('Ticket not found');
        return;
      }

      const ticket = tickets[0];

      if (ticket.checked_in) {
        toast.warning(`Already checked in at ${new Date(ticket.checked_in_at).toLocaleTimeString()}`);
        return;
      }

      // Check in the ticket
      await handleCheckIn(ticket.id);
    } catch (error: any) {
      toast.error('QR scan failed: ' + error.message);
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading check-in dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href={`/admin/events/${id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Event
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Check-In Dashboard</h1>
            <p className="text-muted-foreground">{event?.name}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_capacity}</div>
            <p className="text-xs text-muted-foreground">Total tickets</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Checked In</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.checked_in}</div>
            <p className="text-xs text-muted-foreground">{stats.percentage.toFixed(1)}% of capacity</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.remaining}</div>
            <p className="text-xs text-muted-foreground">Not yet checked in</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Capacity</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.percentage.toFixed(0)}%</div>
            <div className="w-full bg-secondary rounded-full h-2 mt-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${Math.min(stats.percentage, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Search & Check-In */}
        <Card>
          <CardHeader>
            <CardTitle>Manual Check-In</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Search by ticket #, name, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch}>
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>

            {searchResults.length > 0 && (
              <div className="space-y-2">
                {searchResults.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{ticket.attendee_name}</div>
                      <div className="text-sm text-muted-foreground">{ticket.ticket_number}</div>
                      <div className="text-sm text-muted-foreground">{ticket.ticket_type}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {ticket.checked_in ? (
                        <>
                          <Badge variant="default" className="bg-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Checked In
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUndoCheckIn(ticket.id)}
                          >
                            Undo
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleCheckIn(ticket.id)}
                        >
                          Check In
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {searchQuery && searchResults.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No tickets found matching &ldquo;{searchQuery}&rdquo;
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Check-Ins */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Check-Ins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentCheckIns.map((ticket) => (
                <div
                  key={ticket.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-medium">{ticket.attendee_name}</div>
                    <div className="text-sm text-muted-foreground">
                      {ticket.checked_in_at && new Date(ticket.checked_in_at).toLocaleTimeString()}
                    </div>
                  </div>
                  <Badge variant="default" className="bg-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Checked In
                  </Badge>
                </div>
              ))}

              {recentCheckIns.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No check-ins yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* QR Scanner */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">QR Code Scanner</h2>
          <Button
            variant={showScanner ? 'destructive' : 'default'}
            onClick={() => setShowScanner(!showScanner)}
          >
            <QrCode className="h-4 w-4 mr-2" />
            {showScanner ? 'Hide Scanner' : 'Show Scanner'}
          </Button>
        </div>
        
        {showScanner && (
          <QRScanner
            onScan={handleQRScan}
            onError={(error) => {
              console.error('Scanner error:', error);
              toast.error('Scanner error: ' + error.message);
            }}
          />
        )}
      </div>
    </div>
  );
}
