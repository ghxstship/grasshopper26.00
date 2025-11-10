/**
 * StaffScheduler Component
 * GHXSTSHIP Entertainment Platform - Staff scheduling interface
 */

'use client'

import * as React from 'react'
import { useState } from 'react'
import styles from './StaffScheduler.module.css'

export interface StaffMember {
  id: string
  name: string
  role: string
  department?: string
  status: 'available' | 'assigned' | 'on_break' | 'checked_out'
  shiftStart?: Date
  shiftEnd?: Date
}

export interface StaffSchedulerProps {
  staff: StaffMember[]
  onStaffClick?: (staffId: string) => void
  onAddStaff?: () => void
  className?: string
}

export const StaffScheduler: React.FC<StaffSchedulerProps> = ({
  staff,
  onStaffClick,
  onAddStaff,
  className = '',
}) => {
  const [filter, setFilter] = useState<'all' | 'available' | 'assigned'>('all')

  const filteredStaff = staff.filter(member => {
    if (filter === 'all') return true
    return member.status === filter
  })

  const departments = Array.from(new Set(staff.map(s => s.department).filter(Boolean)))

  return (
    <div className={`${styles.scheduler} ${className}`}>
      <div className={styles.header}>
        <h2 className={styles.title}>Staff Scheduler</h2>
        {onAddStaff && (
          <button className={styles.addButton} onClick={onAddStaff}>
            + Add Staff
          </button>
        )}
      </div>

      <div className={styles.summary}>
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Total Staff</span>
          <span className={styles.summaryValue}>{staff.length}</span>
        </div>
        
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Available</span>
          <span className={styles.summaryValue}>
            {staff.filter(s => s.status === 'available').length}
          </span>
        </div>
        
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Assigned</span>
          <span className={styles.summaryValue}>
            {staff.filter(s => s.status === 'assigned').length}
          </span>
        </div>
        
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>On Break</span>
          <span className={styles.summaryValue}>
            {staff.filter(s => s.status === 'on_break').length}
          </span>
        </div>
      </div>

      <div className={styles.filters}>
        <button
          className={`${styles.filterButton} ${filter === 'all' ? styles.active : ''}`}
          onClick={() => setFilter('all')}
        >
          All Staff
        </button>
        <button
          className={`${styles.filterButton} ${filter === 'available' ? styles.active : ''}`}
          onClick={() => setFilter('available')}
        >
          Available
        </button>
        <button
          className={`${styles.filterButton} ${filter === 'assigned' ? styles.active : ''}`}
          onClick={() => setFilter('assigned')}
        >
          Assigned
        </button>
      </div>

      <div className={styles.grid}>
        {filteredStaff.map(member => (
          <div
            key={member.id}
            className={styles.card}
            onClick={() => onStaffClick?.(member.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onStaffClick?.(member.id);
              }
            }}
            role="button"
            tabIndex={0}
          >
            <div className={styles.cardHeader}>
              <div className={styles.cardInfo}>
                <h3 className={styles.staffName}>{member.name}</h3>
                <span className={styles.role}>{member.role}</span>
                {member.department && (
                  <span className={styles.department}>{member.department}</span>
                )}
              </div>
              
              <span className={`${styles.status} ${styles[member.status]}`}>
                {member.status.replace('_', ' ')}
              </span>
            </div>

            {(member.shiftStart || member.shiftEnd) && (
              <div className={styles.shift}>
                <span className={styles.shiftLabel}>Shift:</span>
                <span className={styles.shiftTime}>
                  {member.shiftStart?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                  {member.shiftEnd?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

StaffScheduler.displayName = 'StaffScheduler'
