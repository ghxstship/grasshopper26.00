'use client';

import { useState, useEffect, Suspense } from 'react';
import { createClient } from '@/lib/supabase/client';
import { EventStaffGate } from '@/lib/rbac';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';

// Dynamically import QR scanner to avoid SSR issues
const QRScanner = dynamic(
  () => import('@/components/event-roles/QRScanner').then(mod => ({ default: mod.QRScanner })),
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
      <div className="p-4">
        <p className="text-red-600">No event selected</p>
      </div>
    );
  }

  return (
    <EventStaffGate eventId={eventId} fallback={
      <div className="p-4">
        <p className="text-red-600">Access Denied: Event staff access required</p>
      </div>
    }>
      <div className="min-h-screen bg-gray-50">
        {/* Header with status */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="p-4">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-bold text-gray-900">Ticket Scanner</h1>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm text-gray-600">
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
            {pendingScans.length > 0 && (
              <div className="mt-2 text-sm text-yellow-700 bg-yellow-50 p-2 rounded">
                {pendingScans.length} scan(s) pending sync
              </div>
            )}
          </div>
        </div>

        {/* Scanner */}
        <div className="p-4">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <QRScanner
              onScan={(ticketId: string) => handleScan(ticketId)}
              onError={(error: Error) => addToHistory({
                success: false,
                message: error.message,
                timestamp: new Date(),
              })}
            />
          </div>

          {/* Instructions */}
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">How to Scan</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Point camera at QR code</li>
              <li>• Wait for automatic scan</li>
              <li>• Check result below</li>
              <li>• Works offline - syncs when online</li>
            </ul>
          </div>
        </div>

        {/* Scan history */}
        <div className="p-4">
          <h2 className="font-semibold text-gray-900 mb-3">Recent Scans</h2>
          <div className="space-y-2">
            {scanHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No scans yet</p>
                <p className="text-sm">Scan a ticket to get started</p>
              </div>
            ) : (
              scanHistory.map((result, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border-2 ${
                    result.success
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className={`font-medium ${
                        result.success ? 'text-green-900' : 'text-red-900'
                      }`}>
                        {result.success ? '✓' : '✗'} {result.message}
                      </p>
                      {result.attendeeName && (
                        <p className="text-sm text-gray-700 mt-1">
                          {result.attendeeName}
                        </p>
                      )}
                      <p className="text-xs text-gray-600 mt-1">
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
        <div className="h-20" />
      </div>
    </EventStaffGate>
  );
}

export default function StaffScannerPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading scanner...</p>
        </div>
      </div>
    }>
      <ScannerContent />
    </Suspense>
  );
}
