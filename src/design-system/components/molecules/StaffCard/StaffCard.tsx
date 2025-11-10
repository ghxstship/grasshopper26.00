/**
 * StaffCard Component
 * GHXSTSHIP Entertainment Platform - Staff member card
 */

import * as React from 'react'
import styles from './StaffCard.module.css'

export interface StaffCardProps {
  name: string
  role: string
  email?: string
  phone?: string
  department?: string
  status?: 'available' | 'assigned' | 'on_break' | 'checked_out'
  shiftStart?: Date
  shiftEnd?: Date
  onClick?: () => void
  className?: string
}

export const StaffCard: React.FC<StaffCardProps> = ({
  name,
  role,
  email,
  phone,
  department,
  status = 'available',
  shiftStart,
  shiftEnd,
  onClick,
  className = '',
}) => {
  return (
    <div 
      className={`${styles.card} ${onClick ? styles.clickable : ''} ${className}`}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div className={styles.header}>
        <div className={styles.info}>
          <h3 className={styles.name}>{name}</h3>
          <span className={styles.role}>{role}</span>
          {department && <span className={styles.department}>{department}</span>}
        </div>
        
        <span className={`${styles.status} ${styles[status]}`}>
          {status.replace('_', ' ')}
        </span>
      </div>

      {(email || phone) && (
        <div className={styles.contact}>
          {email && <span className={styles.contactDetail}>{email}</span>}
          {phone && <span className={styles.contactDetail}>{phone}</span>}
        </div>
      )}

      {(shiftStart || shiftEnd) && (
        <div className={styles.shift}>
          <span className={styles.shiftLabel}>Shift:</span>
          <span className={styles.shiftTime}>
            {shiftStart?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
            {shiftEnd?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      )}
    </div>
  )
}

StaffCard.displayName = 'StaffCard'
