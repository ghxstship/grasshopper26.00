/**
 * CheckInSystem Component
 * GHXSTSHIP Entertainment Platform - Attendee check-in system
 */

'use client'

import * as React from 'react'
import { useState } from 'react'
import styles from './CheckInSystem.module.css'

export interface CheckInStats {
  totalCapacity: number
  checkedIn: number
  remaining: number
  checkInRate: number
}

export interface CheckInSystemProps {
  stats: CheckInStats
  onScanTicket?: (ticketNumber: string) => void
  onManualCheckIn?: () => void
  recentCheckIns?: Array<{
    id: string
    ticketNumber: string
    attendeeName: string
    tierName: string
    checkedInAt: Date
  }>
  className?: string
}

export const CheckInSystem: React.FC<CheckInSystemProps> = ({
  stats,
  onScanTicket,
  onManualCheckIn,
  recentCheckIns = [],
  className = '',
}) => {
  const [scanInput, setScanInput] = useState('')
  const checkInPercentage = (stats.checkedIn / stats.totalCapacity) * 100

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault()
    if (scanInput.trim()) {
      onScanTicket?.(scanInput.trim())
      setScanInput('')
    }
  }

  return (
    <div className={`${styles.system} ${className}`}>
      <div className={styles.header}>
        <h2 className={styles.title}>Check-In System</h2>
      </div>

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total Capacity</span>
          <span className={styles.statValue}>{stats.totalCapacity}</span>
        </div>

        <div className={styles.statCard}>
          <span className={styles.statLabel}>Checked In</span>
          <span className={styles.statValue}>{stats.checkedIn}</span>
        </div>

        <div className={styles.statCard}>
          <span className={styles.statLabel}>Remaining</span>
          <span className={styles.statValue}>{stats.remaining}</span>
        </div>

        <div className={styles.statCard}>
          <span className={styles.statLabel}>Check-In Rate</span>
          <span className={styles.statValue}>{stats.checkInRate.toFixed(1)}/min</span>
        </div>
      </div>

      <div className={styles.progress}>
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill} 
            style={{ width: `${checkInPercentage}%` }}
          />
        </div>
        <span className={styles.progressLabel}>
          {checkInPercentage.toFixed(1)}% Capacity
        </span>
      </div>

      <div className={styles.scanner}>
        <form onSubmit={handleScan} className={styles.scanForm}>
          <input
            type="text"
            value={scanInput}
            onChange={e => setScanInput(e.target.value)}
            placeholder="Scan or enter ticket number..."
            className={styles.scanInput}
            />
          <button type="submit" className={styles.scanButton}>
            Check In
          </button>
        </form>

        {onManualCheckIn && (
          <button className={styles.manualButton} onClick={onManualCheckIn}>
            Manual Check-In
          </button>
        )}
      </div>

      {recentCheckIns.length > 0 && (
        <div className={styles.recent}>
          <h3 className={styles.recentTitle}>Recent Check-Ins</h3>
          <div className={styles.recentList}>
            {recentCheckIns.slice(0, 10).map(checkIn => (
              <div key={checkIn.id} className={styles.recentItem}>
                <div className={styles.recentInfo}>
                  <span className={styles.recentName}>{checkIn.attendeeName}</span>
                  <span className={styles.recentTicket}>#{checkIn.ticketNumber}</span>
                  <span className={styles.recentTier}>{checkIn.tierName}</span>
                </div>
                <span className={styles.recentTime}>
                  {checkIn.checkedInAt.toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

CheckInSystem.displayName = 'CheckInSystem'
