'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { scanTicket, getCheckInStats } from '@/lib/actions/check-ins';
import styles from './page.module.css';

export default function CheckInPage() {
  const params = useParams();
  const eventId = params.id as string;
  
  const [ticketNumber, setTicketNumber] = useState('');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const data = await getCheckInStats(eventId);
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  }

  async function handleScan(e: React.FormEvent) {
    e.preventDefault();
    if (!ticketNumber.trim()) return;

    setScanning(true);
    setError(null);
    setResult(null);

    try {
      const checkIn = await scanTicket(ticketNumber.trim(), eventId, 'manual');
      setResult(checkIn);
      setTicketNumber('');
      await loadStats();
    } catch (err: any) {
      setError(err.message || 'Failed to check in ticket');
    } finally {
      setScanning(false);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>CHECK-IN</h1>
      </div>

      {stats && (
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statValue}>{stats.totalCheckIns}</span>
            <span className={styles.statLabel}>CHECKED IN</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{stats.totalTickets}</span>
            <span className={styles.statLabel}>TOTAL TICKETS</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{stats.checkInRate.toFixed(1)}%</span>
            <span className={styles.statLabel}>CHECK-IN RATE</span>
          </div>
          {stats.duplicates > 0 && (
            <div className={styles.stat}>
              <span className={`${styles.statValue} ${styles.warning}`}>{stats.duplicates}</span>
              <span className={styles.statLabel}>DUPLICATES</span>
            </div>
          )}
        </div>
      )}

      <div className={styles.scanSection}>
        <form onSubmit={handleScan} className={styles.scanForm}>
          <input
            type="text"
            value={ticketNumber}
            onChange={(e) => setTicketNumber(e.target.value)}
            placeholder="ENTER TICKET NUMBER OR SCAN QR CODE"
            className={styles.input}
            disabled={scanning}
          />
          <button
            type="submit"
            className={styles.scanButton}
            disabled={scanning || !ticketNumber.trim()}
          >
            {scanning ? 'CHECKING IN...' : 'CHECK IN'}
          </button>
        </form>

        {error && (
          <div className={styles.error}>
            <span className={styles.errorIcon}>✕</span>
            <span className={styles.errorText}>{error}</span>
          </div>
        )}

        {result && (
          <div className={`${styles.result} ${styles[result.check_in_status]}`}>
            {result.check_in_status === 'completed' && (
              <>
                <span className={styles.resultIcon}>✓</span>
                <div className={styles.resultContent}>
                  <span className={styles.resultTitle}>CHECK-IN SUCCESSFUL</span>
                  {result.attendee_name && (
                    <span className={styles.resultDetail}>{result.attendee_name}</span>
                  )}
                  {result.ticket_tier && (
                    <span className={styles.resultDetail}>{result.ticket_tier}</span>
                  )}
                </div>
              </>
            )}
            {result.check_in_status === 'duplicate' && (
              <>
                <span className={styles.resultIcon}>⚠</span>
                <div className={styles.resultContent}>
                  <span className={styles.resultTitle}>ALREADY CHECKED IN</span>
                  <span className={styles.resultDetail}>This ticket was already scanned</span>
                </div>
              </>
            )}
            {result.check_in_status === 'invalid' && (
              <>
                <span className={styles.resultIcon}>✕</span>
                <div className={styles.resultContent}>
                  <span className={styles.resultTitle}>INVALID TICKET</span>
                  <span className={styles.resultDetail}>This ticket cannot be checked in</span>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
