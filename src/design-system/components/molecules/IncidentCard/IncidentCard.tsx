/**
 * IncidentCard Component
 * GHXSTSHIP Entertainment Platform - Incident report card
 */

import * as React from 'react'
import styles from './IncidentCard.module.css'

export interface IncidentCardProps {
  incidentNumber: string
  type: 'security' | 'medical' | 'technical' | 'weather' | 'other'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  location?: string
  reportedAt: Date
  reportedBy?: string
  status: 'reported' | 'investigating' | 'resolved' | 'escalated'
  responseTime?: number
  onClick?: () => void
  className?: string
}

export const IncidentCard: React.FC<IncidentCardProps> = ({
  incidentNumber,
  type,
  severity,
  description,
  location,
  reportedAt,
  reportedBy,
  status,
  responseTime,
  onClick,
  className = '',
}) => {
  return (
    <div 
      className={`${styles.card} ${styles[severity]} ${onClick ? styles.clickable : ''} ${className}`}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className={styles.header}>
        <div className={styles.badges}>
          <span className={`${styles.severity} ${styles[severity]}`}>
            {severity}
          </span>
          <span className={`${styles.type} ${styles[type]}`}>
            {type}
          </span>
        </div>
        
        <span className={`${styles.status} ${styles[status]}`}>
          {status}
        </span>
      </div>

      <div 
        className={styles.content} 
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
        <span className={styles.incidentNumber}>#{incidentNumber}</span>
        <p className={styles.description}>{description}</p>
      </div>

      <div className={styles.meta}>
        {location && (
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Location:</span>
            <span className={styles.metaValue}>{location}</span>
          </div>
        )}
        
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Reported:</span>
          <span className={styles.metaValue}>
            {reportedAt.toLocaleString()}
          </span>
        </div>

        {reportedBy && (
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>By:</span>
            <span className={styles.metaValue}>{reportedBy}</span>
          </div>
        )}

        {responseTime !== undefined && (
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Response Time:</span>
            <span className={styles.metaValue}>{responseTime} min</span>
          </div>
        )}
      </div>
    </div>
  )
}

IncidentCard.displayName = 'IncidentCard'
