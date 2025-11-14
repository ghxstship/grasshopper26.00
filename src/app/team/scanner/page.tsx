'use client';

import { useState, useEffect, Suspense } from 'react';
import { createClient } from '@/lib/supabase/client';
import { EventStaffGate } from '@/lib/rbac';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { 
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Heading,
  Text,
  Stack,
  Spinner,
  Badge
} from '@/design-system';
import styles from './scanner.module.css';

// Placeholder for QR scanner component
const QRScanner = ({ eventId, onScan }: { eventId: string; onScan: (ticketId: string) => void }) => (
  <div className={styles.qrScannerPlaceholder}>
    <Text size="lg" weight="bold">QR Scanner Placeholder</Text>
    <Text color="secondary">Camera access would be enabled here</Text>
  </div>
);

interface ScanResult {
  success: boolean;
  message: string;
  ticketId?: string;
  attendeeName?: string;
  timestamp: Date;
}

function ScannerContent() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get('eventId');
  
  const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [pendingScans, setPendingScans] = useState<string[]>([]);

  useEffect(() => {
    // Monitor online/offline status
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
    // Load pending scans from localStorage
    const stored = localStorage.getItem('pendingScans');
    if (stored) {
      setPendingScans(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    // Sync pending scans when coming back online
    if (isOnline && pendingScans.length > 0) {
      syncPendingScans();
    }
  }, [isOnline]);

  async function syncPendingScans() {
    const supabase = createClient();
    const synced: string[] = [];

    for (const ticketId of pendingScans) {
      try {
        await supabase
          .from('tickets')
          .update({ 
            checked_in_at: new Date().toISOString(),
            status: 'checked_in'
          })
          .eq('id', ticketId);

        synced.push(ticketId);
      } catch (error) {
        console.error('Error syncing ticket:', ticketId, error);
      }
    }

    // Remove synced tickets from pending
    const remaining = pendingScans.filter(id => !synced.includes(id));
    setPendingScans(remaining);
    localStorage.setItem('pendingScans', JSON.stringify(remaining));
  }

  async function handleScan(ticketId: string) {
    try {
      const supabase = createClient();

      // Check if ticket exists and is valid
      const { data: ticket, error: ticketError } = await supabase
        .from('tickets')
        .select(`
          id,
          status,
          checked_in_at,
          orders!inner(
            id,
            event_id,
            user_profiles(display_name)
          )
        `)
        .eq('id', ticketId)
        .single() as {
          data: {
            id: string;
            status: string;
            checked_in_at: string | null;
            orders: {
              id: string;
              event_id: string;
              user_profiles: {
                display_name: string;
              } | null;
            };
          } | null;
          error: any;
        };

      if (ticketError || !ticket) {
        addToHistory({
          success: false,
          message: 'Invalid ticket',
          timestamp: new Date(),
        });
        return;
      }

      // Check if ticket is for this event
      if (ticket.orders.event_id !== eventId) {
        addToHistory({
          success: false,
          message: 'Ticket is for a different event',
          timestamp: new Date(),
        });
        return;
      }

      // Check if already checked in
      if (ticket.checked_in_at) {
        addToHistory({
          success: false,
          message: 'Already checked in',
          ticketId,
          timestamp: new Date(),
        });
        return;
      }

      // Perform check-in
      if (isOnline) {
        const { error: updateError } = await supabase
          .from('tickets')
          .update({ 
            checked_in_at: new Date().toISOString(),
            status: 'checked_in'
          })
          .eq('id', ticketId);

        if (updateError) throw updateError;

        addToHistory({
          success: true,
          message: 'Check-in successful',
          ticketId,
          attendeeName: ticket.orders.user_profiles?.display_name,
          timestamp: new Date(),
        });
      } else {
        // Offline mode - queue for sync
        const updated = [...pendingScans, ticketId];
        setPendingScans(updated);
        localStorage.setItem('pendingScans', JSON.stringify(updated));

        addToHistory({
          success: true,
          message: 'Checked in (offline - will sync)',
          ticketId,
          attendeeName: ticket.orders.user_profiles?.display_name,
          timestamp: new Date(),
        });
      }
    } catch (error: any) {
      console.error('Scan error:', error);
      addToHistory({
        success: false,
        message: error.message || 'Scan failed',
        timestamp: new Date(),
      });
    }
  }

  function addToHistory(result: ScanResult) {
    setScanHistory(prev => [result, ...prev].slice(0, 20)); // Keep last 20
  }

  if (!eventId) {
    return (
      <div className={styles.container}>
        <Card>
          <CardContent>
            <Text>No event selected</Text>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <EventStaffGate eventId={eventId} fallback={
      <div className={styles.container}>
        <Card>
          <CardContent>
            <Text>Access Denied: Event staff access required</Text>
          </CardContent>
        </Card>
      </div>
    }>
      <div className={styles.container}>
        {/* Header with status */}
        <div className={styles.header}>
          <Stack gap={2}>
            <div className={styles.statusRow}>
              <Heading level={1}>Ticket Scanner</Heading>
              <div className={styles.statusRow}>
                <div className={`${styles.statusIndicator} ${isOnline ? styles.statusOnline : styles.statusOffline}`} />
                <Text weight="bold">
                  {isOnline ? 'Online' : 'Offline'}
                </Text>
              </div>
            </div>
            {pendingScans.length > 0 && (
              <div className={styles.warningBox}>
                <Text size="sm">{pendingScans.length} scan(s) pending sync</Text>
              </div>
            )}
          </Stack>
        </div>

        {/* Scanner */}
        <Stack gap={4}>
          <Card>
            <CardContent>
              <QRScanner
                eventId={eventId || ''}
                onScan={(ticketId: string) => handleScan(ticketId)}
              />
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>How to Scan</CardTitle>
            </CardHeader>
            <CardContent>
              <Stack gap={2}>
                <Text>• Point camera at QR code</Text>
                <Text>• Wait for automatic scan</Text>
                <Text>• Check result below</Text>
                <Text>• Works offline - syncs when online</Text>
              </Stack>
            </CardContent>
          </Card>
        </Stack>

        {/* Scan history */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Scans</CardTitle>
          </CardHeader>
          <CardContent>
            {scanHistory.length === 0 ? (
              <div className={styles.emptyState}>
                <Stack gap={2} align="center">
                  <Text size="lg" weight="bold">No scans yet</Text>
                  <Text color="secondary">Scan a ticket to get started</Text>
                </Stack>
              </div>
            ) : (
              <Stack gap={2}>
                {scanHistory.map((result, index) => (
                  <div
                    key={index}
                    className={`${styles.scanHistoryItem} ${
                      result.success
                        ? styles.scanSuccess
                        : styles.scanError
                    }`}
                  >
                    <Stack gap={1}>
                      <Text weight="bold">
                        {result.success ? '✓' : '✗'} {result.message}
                      </Text>
                      {result.attendeeName && (
                        <Text size="sm" color="secondary">
                          {result.attendeeName}
                        </Text>
                      )}
                      <Text size="sm" color="secondary">
                        {result.timestamp.toLocaleTimeString()}
                      </Text>
                    </Stack>
                  </div>
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>
      </div>
    </EventStaffGate>
  );
}

export default function StaffScannerPage() {
  return (
    <Suspense fallback={
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <Spinner size="lg" />
          <Text color="secondary">Loading scanner...</Text>
        </div>
      </div>
    }>
      <ScannerContent />
    </Suspense>
  );
}
