'use client';

import { useState, useEffect, Suspense } from 'react';
import { createClient } from '@/lib/supabase/client';
import { EventStaffGate } from '@/lib/rbac';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import styles from './page.module.css';

// Dynamically import QR scanner to avoid SSR issues
const QRScanner = dynamic(
  () => import('@/design-system/components/organisms/event-roles/QRScanner').then(mod => ({ default: mod.QRScanner })),
  { ssr: false }
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
      <div className={styles.emptyState}>
        <p className={styles.emptyText}>No event selected</p>
      </div>
    );
  }

  return (
    <EventStaffGate eventId={eventId} fallback={
      <div className={styles.emptyState}>
        <p className={styles.emptyText}>Access Denied: Event staff access required</p>
      </div>
    }>
      <div className={styles.container}>
        {/* Header with status */}
        <div className={styles.header}>
          <div className={styles.content}>
            <div className={styles.row}>
              <h1 className={styles.title}>Ticket Scanner</h1>
              <div className={styles.row}>
                <div className={`${styles.statusIndicator} ${isOnline ? styles.statusOnline : styles.statusOffline}`} />
                <span className={styles.subtitle}>
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
            {pendingScans.length > 0 && (
              <div className={styles.container}>
                {pendingScans.length} scan(s) pending sync
              </div>
            )}
          </div>
        </div>

        {/* Scanner */}
        <div className={styles.content}>
          <div className={styles.card}>
            <QRScanner
              eventId={eventId || ''}
              onScan={(ticketId: string) => handleScan(ticketId)}
            />
          </div>

          {/* Instructions */}
          <div className={styles.card}>
            <h3 className={styles.subtitle}>How to Scan</h3>
            <ul className={styles.section}>
              <li>• Point camera at QR code</li>
              <li>• Wait for automatic scan</li>
              <li>• Check result below</li>
              <li>• Works offline - syncs when online</li>
            </ul>
          </div>
        </div>

        {/* Scan history */}
        <div className={styles.content}>
          <h2 className={styles.title}>Recent Scans</h2>
          <div className={styles.section}>
            {scanHistory.length === 0 ? (
              <div className={styles.emptyState}>
                <p className={styles.emptyText}>No scans yet</p>
                <p className={styles.emptyText}>Scan a ticket to get started</p>
              </div>
            ) : (
              scanHistory.map((result, index) => (
                <div
                  key={index}
                  className={`${styles.scanHistoryItem} ${
                    result.success
                      ? styles.scanSuccess
                      : styles.scanError
                  }`}
                >
                  <div className={styles.row}>
                    <div className={styles.section}>
                      <p className={`${styles.fontMedium} ${styles.textBlack}`}>
                        {result.success ? '✓' : '✗'} {result.message}
                      </p>
                      {result.attendeeName && (
                        <p className={styles.textSmall}>
                          {result.attendeeName}
                        </p>
                      )}
                      <p className={styles.textSmall}>
                        {result.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Bottom padding */}
        <div className={styles.emptyState} />
      </div>
    </EventStaffGate>
  );
}

export default function StaffScannerPage() {
  return (
    <Suspense fallback={
      <div className={styles.row}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p className={styles.subtitle}>Loading scanner...</p>
        </div>
      </div>
    }>
      <ScannerContent />
    </Suspense>
  );
}
