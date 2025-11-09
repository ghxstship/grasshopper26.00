/**
 * Mobile Credential Check-In Interface
 * Optimized for mobile devices with QR scanning and offline capability
 */

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/design-system/components/atoms/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/components/atoms/card';
import { Input } from '@/design-system/components/atoms/input';
import { Badge } from '@/design-system/components/atoms/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/design-system/components/atoms/select';
import {
  QrCode,
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  Wifi,
  WifiOff,
  Users,
  Shield,
} from 'lucide-react';
import { toast } from 'sonner';
import { QRScanner } from '@/components/event-roles/QRScanner';

interface Credential {
  id: string;
  credential_number: string;
  credential_type: string;
  holder_name: string;
  holder_company: string | null;
  holder_role: string | null;
  is_active: boolean;
  checked_in: boolean;
  checked_in_at: string | null;
  revoked: boolean;
  event_id: string;
}

interface CheckInRecord {
  id: string;
  credential_number: string;
  holder_name: string;
  credential_type: string;
  checked_in_at: string;
  synced: boolean;
}

const CREDENTIAL_TYPES: Record<string, { label: string; badge: string }> = {
  aaa: { label: 'AAA', badge: '🔴' },
  aa: { label: 'AA', badge: '🟡' },
  production: { label: 'Production', badge: '🔵' },
  staff: { label: 'Staff', badge: '🟢' },
  vendor: { label: 'Vendor', badge: '🟠' },
  media: { label: 'Media', badge: '🟣' },
  guest: { label: 'Guest', badge: '⚪' },
};

export default function CredentialCheckInPage() {
  const supabase = createClient();
  
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [showScanner, setShowScanner] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Credential[]>([]);
  const [recentCheckIns, setRecentCheckIns] = useState<CheckInRecord[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    checkedIn: 0,
    pending: 0,
  });

  useEffect(() => {
    loadEvents();
    loadOfflineCheckIns();
    
    // Monitor online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      loadStats();
    }
  }, [selectedEvent]);

  useEffect(() => {
    if (isOnline && recentCheckIns.some(r => !r.synced)) {
      syncOfflineCheckIns();
    }
  }, [isOnline]);

  const loadEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('id, name, start_date')
        .gte('start_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('start_date', { ascending: true })
        .limit(10);

      if (error) throw error;
      setEvents(data || []);
      
      if (data && data.length > 0) {
        setSelectedEvent(data[0].id);
      }
    } catch (error: any) {
      console.error('Failed to load events:', error);
    }
  };

  const loadStats = async () => {
    if (!selectedEvent) return;

    try {
      const { count: total } = await supabase
        .from('event_credentials')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', selectedEvent)
        .eq('is_active', true);

      const { count: checkedIn } = await supabase
        .from('event_credentials')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', selectedEvent)
        .eq('checked_in', true);

      setStats({
        total: total || 0,
        checkedIn: checkedIn || 0,
        pending: (total || 0) - (checkedIn || 0),
      });
    } catch (error: any) {
      console.error('Failed to load stats:', error);
    }
  };

  const loadOfflineCheckIns = () => {
    const stored = localStorage.getItem('offline_checkins');
    if (stored) {
      setRecentCheckIns(JSON.parse(stored));
    }
  };

  const saveOfflineCheckIn = (record: CheckInRecord) => {
    const updated = [record, ...recentCheckIns].slice(0, 50);
    setRecentCheckIns(updated);
    localStorage.setItem('offline_checkins', JSON.stringify(updated));
  };

  const syncOfflineCheckIns = async () => {
    const unsyncedRecords = recentCheckIns.filter(r => !r.synced);
    
    for (const record of unsyncedRecords) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) continue;

        await supabase
          .from('event_credentials')
          .update({
            checked_in: true,
            checked_in_at: record.checked_in_at,
            checked_in_by: user.id,
          })
          .eq('credential_number', record.credential_number);

        // Mark as synced
        const updated = recentCheckIns.map(r =>
          r.id === record.id ? { ...r, synced: true } : r
        );
        setRecentCheckIns(updated);
        localStorage.setItem('offline_checkins', JSON.stringify(updated));
      } catch (error) {
        console.error('Failed to sync check-in:', error);
      }
    }

    if (unsyncedRecords.length > 0) {
      toast.success(`Synced ${unsyncedRecords.length} offline check-ins`);
      loadStats();
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() || !selectedEvent) {
      setSearchResults([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('event_credentials')
        .select('*')
        .eq('event_id', selectedEvent)
        .or(`credential_number.ilike.%${searchQuery}%,holder_name.ilike.%${searchQuery}%`)
        .limit(10);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error: any) {
      toast.error('Search failed');
      console.error(error);
    }
  };

  const handleQRScan = async (qrData: string) => {
    try {
      // Parse QR data
      const data = JSON.parse(qrData);
      const credentialNumber = data.number || data.credential_number;

      if (!credentialNumber) {
        toast.error('Invalid QR code');
        return;
      }

      // Find credential
      const { data: credentials, error } = await supabase
        .from('event_credentials')
        .select('*')
        .eq('credential_number', credentialNumber)
        .limit(1);

      if (error) throw error;

      if (!credentials || credentials.length === 0) {
        toast.error('Credential not found');
        return;
      }

      const credential = credentials[0];
      await handleCheckIn(credential);
    } catch (error: any) {
      toast.error('QR scan failed: ' + error.message);
      console.error(error);
    }
  };

  const handleCheckIn = async (credential: Credential) => {
    try {
      // Validation checks
      if (credential.revoked) {
        toast.error('⛔ Credential has been revoked');
        return;
      }

      if (!credential.is_active) {
        toast.error('⛔ Credential is not active');
        return;
      }

      if (credential.checked_in) {
        toast.warning(`Already checked in at ${new Date(credential.checked_in_at!).toLocaleTimeString()}`);
        return;
      }

      const checkInRecord: CheckInRecord = {
        id: crypto.randomUUID(),
        credential_number: credential.credential_number,
        holder_name: credential.holder_name,
        credential_type: credential.credential_type,
        checked_in_at: new Date().toISOString(),
        synced: false,
      };

      if (isOnline) {
        // Online check-in
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { error } = await supabase
          .from('event_credentials')
          .update({
            checked_in: true,
            checked_in_at: checkInRecord.checked_in_at,
            checked_in_by: user.id,
          })
          .eq('id', credential.id);

        if (error) throw error;

        checkInRecord.synced = true;
        toast.success(`✅ ${credential.holder_name} checked in`);
      } else {
        // Offline check-in
        toast.success(`✅ ${credential.holder_name} checked in (offline - will sync)`);
      }

      saveOfflineCheckIn(checkInRecord);
      loadStats();
      setSearchResults([]);
      setSearchQuery('');
    } catch (error: any) {
      toast.error('Check-in failed: ' + error.message);
      console.error(error);
    }
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-2xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Credential Check-In</h1>
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <Wifi className="h-3 w-3 mr-1" />
                Online
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                <WifiOff className="h-3 w-3 mr-1" />
                Offline
              </Badge>
            )}
          </div>
        </div>

        {/* Event Selector */}
        <Select value={selectedEvent} onValueChange={setSelectedEvent}>
          <SelectTrigger>
            <SelectValue placeholder="Select event..." />
          </SelectTrigger>
          <SelectContent>
            {events.map((event) => (
              <SelectItem key={event.id} value={event.id}>
                {event.name} - {new Date(event.start_date).toLocaleDateString()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="text-center">
              <Users className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="text-center">
              <CheckCircle className="h-5 w-5 mx-auto mb-1 text-green-600" />
              <div className="text-2xl font-bold text-green-600">{stats.checkedIn}</div>
              <p className="text-xs text-muted-foreground">Checked In</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="text-center">
              <AlertCircle className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
              <div className="text-2xl font-bold">{stats.pending}</div>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* QR Scanner Toggle */}
      <div className="mb-6">
        <Button
          onClick={() => setShowScanner(!showScanner)}
          className="w-full"
          size="lg"
          variant={showScanner ? 'destructive' : 'default'}
        >
          <QrCode className="h-5 w-5 mr-2" />
          {showScanner ? 'Hide Scanner' : 'Scan QR Code'}
        </Button>
      </div>

      {/* QR Scanner */}
      {showScanner && (
        <div className="mb-6">
          <QRScanner
            onScan={handleQRScan}
            onError={(error) => {
              console.error('Scanner error:', error);
              toast.error('Scanner error: ' + error.message);
            }}
          />
        </div>
      )}

      {/* Manual Search */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Manual Search</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search by name or credential number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4" />
            </Button>
          </div>

          {searchResults.length > 0 && (
            <div className="space-y-2">
              {searchResults.map((credential) => {
                const credType = CREDENTIAL_TYPES[credential.credential_type] || { label: credential.credential_type, badge: '⚪' };
                return (
                  <div
                    key={credential.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{credType.badge}</span>
                      <div>
                        <p className="font-medium">{credential.holder_name}</p>
                        <p className="text-sm text-muted-foreground">{credential.credential_number}</p>
                      </div>
                    </div>
                    {credential.checked_in ? (
                      <Badge variant="default" className="bg-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Checked In
                      </Badge>
                    ) : credential.revoked ? (
                      <Badge variant="destructive">
                        <XCircle className="h-3 w-3 mr-1" />
                        Revoked
                      </Badge>
                    ) : (
                      <Button size="sm" onClick={() => handleCheckIn(credential)}>
                        Check In
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Check-Ins */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Check-Ins</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentCheckIns.slice(0, 10).map((record) => {
              const credType = CREDENTIAL_TYPES[record.credential_type] || { label: record.credential_type, badge: '⚪' };
              return (
                <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{credType.badge}</span>
                    <div>
                      <p className="font-medium text-sm">{record.holder_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(record.checked_in_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  {record.synced ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Synced
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Pending
                    </Badge>
                  )}
                </div>
              );
            })}

            {recentCheckIns.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Shield className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No check-ins yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
