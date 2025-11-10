/**
 * IncidentBoard Component
 * GHXSTSHIP Entertainment Platform - Incident management board
 */

'use client'

import * as React from 'react'
import { useState } from 'react'
import styles from './IncidentBoard.module.css'

export interface Incident {
  id: string
  incidentNumber: string
  type: 'security' | 'medical' | 'technical' | 'weather' | 'other'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  location?: string
  reportedAt: Date
  reportedBy?: string
  status: 'reported' | 'investigating' | 'resolved' | 'escalated'
  responseTime?: number
}

export interface IncidentBoardProps {
  incidents: Incident[]
  onIncidentClick?: (incidentId: string) => void
  onReportIncident?: () => void
  className?: string
}

export const IncidentBoard: React.FC<IncidentBoardProps> = ({
  incidents,
  onIncidentClick,
  onReportIncident,
  className = '',
}) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'critical'>('all')

  const filteredIncidents = incidents.filter(incident => {
    if (filter === 'all') return true
    if (filter === 'active') return incident.status !== 'resolved'
    if (filter === 'critical') return incident.severity === 'critical'
    return true
  })

  const activeCount = incidents.filter(i => i.status !== 'resolved').length
  const criticalCount = incidents.filter(i => i.severity === 'critical').length

  return (
    <div className={`${styles.board} ${className}`}>
      <div className={styles.header}>
        <h2 className={styles.title}>Incident Board</h2>
        {onReportIncident && (
          <button className={styles.reportButton} onClick={onReportIncident}>
            + Report Incident
          </button>
        )}
      </div>

      <div className={styles.summary}>
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Total Incidents</span>
          <span className={styles.summaryValue}>{incidents.length}</span>
        </div>

        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Active</span>
          <span className={styles.summaryValue}>{activeCount}</span>
        </div>

        <div className={`${styles.summaryCard} ${styles.critical}`}>
          <span className={styles.summaryLabel}>Critical</span>
          <span className={styles.summaryValue}>{criticalCount}</span>
        </div>

        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Resolved</span>
          <span className={styles.summaryValue}>
            {incidents.filter(i => i.status === 'resolved').length}
          </span>
        </div>
      </div>

      <div className={styles.filters}>
        <button
          className={`${styles.filterButton} ${filter === 'all' ? styles.active : ''}`}
          onClick={() => setFilter('all')}
        >
          All Incidents
        </button>
        <button
          className={`${styles.filterButton} ${filter === 'active' ? styles.active : ''}`}
          onClick={() => setFilter('active')}
        >
          Active ({activeCount})
        </button>
        <button
          className={`${styles.filterButton} ${filter === 'critical' ? styles.active : ''}`}
          onClick={() => setFilter('critical')}
        >
          Critical ({criticalCount})
        </button>
      </div>

      <div className={styles.list}>
        {filteredIncidents.map(incident => (
          <div
            key={incident.id}
          >
            <div
              className={styles.incident}
              onClick={() => onIncidentClick?.(incident.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onIncidentClick?.(incident.id);
                }
              }}
              role="button"
              tabIndex={0}
            >
              <div className={styles.cardHeader}>
                <div className={styles.badges}>
                  <span className={`${styles.severity} ${styles[incident.severity]}`}>
                    {incident.severity}
                  </span>
                  <span className={`${styles.type} ${styles[incident.type]}`}>
                    {incident.type}
                  </span>
                </div>
                
                <span className={`${styles.status} ${styles[incident.status]}`}>
                  {incident.status}
                </span>
                <span className={`${styles.type} ${styles[incident.type]}`}>
                  {incident.type}
                </span>
              </div>
              
              <span className={`${styles.status} ${styles[incident.status]}`}>
                {incident.status}
              </span>
            </div>

            <div className={styles.content}>
              <span className={styles.incidentNumber}>#{incident.incidentNumber}</span>
              <p className={styles.description}>{incident.description}</p>
            </div>

            <div className={styles.meta}>
              {incident.location && (
                <span className={styles.metaItem}>📍 {incident.location}</span>
              )}
              <span className={styles.metaItem}>
                🕐 {incident.reportedAt.toLocaleTimeString()}
              </span>
              {incident.responseTime !== undefined && (
                <span className={styles.metaItem}>
                  ⏱️ {incident.responseTime} min
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

IncidentBoard.displayName = 'IncidentBoard'
