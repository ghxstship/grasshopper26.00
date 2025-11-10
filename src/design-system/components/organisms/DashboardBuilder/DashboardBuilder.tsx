/**
 * DashboardBuilder Component
 * GHXSTSHIP Entertainment Platform - Drag-and-drop dashboard builder
 */

'use client'

import * as React from 'react'
import { useState } from 'react'
import styles from './DashboardBuilder.module.css'

export interface DashboardWidget {
  id: string
  type: 'chart' | 'table' | 'kpi' | 'list' | 'calendar'
  title: string
  size: 'small' | 'medium' | 'large' | 'full'
  position: { row: number; col: number }
  config?: Record<string, any>
}

export interface DashboardBuilderProps {
  widgets: DashboardWidget[]
  onWidgetAdd?: (type: DashboardWidget['type']) => void
  onWidgetClick?: (widgetId: string) => void
  onWidgetRemove?: (widgetId: string) => void
  onSave?: (widgets: DashboardWidget[]) => void
  className?: string
}

export const DashboardBuilder: React.FC<DashboardBuilderProps> = ({
  widgets,
  onWidgetAdd,
  onWidgetClick,
  onWidgetRemove,
  onSave,
  className = '',
}) => {
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null)

  const getWidgetIcon = (type: DashboardWidget['type']) => {
    switch (type) {
      case 'chart': return '📊'
      case 'table': return '📋'
      case 'kpi': return '📈'
      case 'list': return '📝'
      case 'calendar': return '📅'
      default: return '□'
    }
  }

  const getSizeClass = (size: DashboardWidget['size']) => {
    switch (size) {
      case 'small': return styles.small
      case 'medium': return styles.medium
      case 'large': return styles.large
      case 'full': return styles.full
      default: return styles.medium
    }
  }

  return (
    <div className={`${styles.builder} ${className}`}>
      <div className={styles.toolbar}>
        <h3 className={styles.title}>Dashboard Builder</h3>
        
        <div className={styles.widgetTypes}>
          <div
            className={styles.widgetButton}
            onClick={() => onWidgetAdd?.('chart')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onWidgetAdd?.('chart');
              }
            }}
            role="button"
            tabIndex={0}
          >
            📊 Chart
          </div>
          <div
            className={styles.widgetButton}
            onClick={() => onWidgetAdd?.('table')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onWidgetAdd?.('table');
              }
            }}
            role="button"
            tabIndex={0}
          >
            📋 Table
          </div>
          <div
            className={styles.widgetButton}
            onClick={() => onWidgetAdd?.('kpi')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onWidgetAdd?.('kpi');
              }
            }}
            role="button"
            tabIndex={0}
          >
            📈 KPI
          </div>
          <div
            className={styles.widgetButton}
            onClick={() => onWidgetAdd?.('list')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onWidgetAdd?.('list');
              }
            }}
            role="button"
            tabIndex={0}
          >
            📝 List
          </div>
          <div
            className={styles.widgetButton}
            onClick={() => onWidgetAdd?.('calendar')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onWidgetAdd?.('calendar');
              }
            }}
            role="button"
            tabIndex={0}
          >
            📅 Calendar
          </div>
        </div>

        {onSave && (
          <button className={styles.saveButton} onClick={() => onSave(widgets)}>
            Save Dashboard
          </button>
        )}
      </div>

      <div className={styles.canvas}>
        <div className={styles.grid}>
          {widgets.map(widget => (
            <div
              key={widget.id}
              className={`${styles.widget} ${getSizeClass(widget.size)} ${selectedWidget === widget.id ? styles.selected : ''}`}
              onClick={() => {
                setSelectedWidget(widget.id);
                onWidgetClick?.(widget.id);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedWidget(widget.id);
                  onWidgetClick?.(widget.id);
                }
              }}
              role="button"
              tabIndex={0}
            >
              <div className={styles.widgetHeader}>
                <span className={styles.widgetIcon}>{getWidgetIcon(widget.type)}</span>
                <span className={styles.widgetTitle}>{widget.title}</span>
                {onWidgetRemove && (
                  <button
                    className={styles.removeButton}
                    onClick={e => {
                      e.stopPropagation()
                      onWidgetRemove(widget.id)
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
              <div className={styles.widgetContent}>
                <div className={styles.placeholder}>
                  {widget.type} widget
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

DashboardBuilder.displayName = 'DashboardBuilder'
