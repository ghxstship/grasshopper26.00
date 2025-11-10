/**
 * AutomationLayout Template
 * GHXSTSHIP Entertainment Platform - Automation and workflow layout
 */

import * as React from 'react'
import styles from './AutomationLayout.module.css'

export interface AutomationLayoutProps {
  header: React.ReactNode
  sidebar?: React.ReactNode
  workflowCanvas: React.ReactNode
  propertiesPanel?: React.ReactNode
  footer?: React.ReactNode
  className?: string
}

export const AutomationLayout: React.FC<AutomationLayoutProps> = ({
  header,
  sidebar,
  workflowCanvas,
  propertiesPanel,
  footer,
  className = '',
}) => {
  return (
    <div className={`${styles.layout} ${className}`}>
      {header && <header className={styles.header}>{header}</header>}

      <div className={styles.main}>
        {sidebar && <aside className={styles.sidebar}>{sidebar}</aside>}

        <div className={styles.canvas}>{workflowCanvas}</div>

        {propertiesPanel && (
          <aside className={styles.properties}>{propertiesPanel}</aside>
        )}
      </div>

      {footer && <footer className={styles.footer}>{footer}</footer>}
    </div>
  )
}

AutomationLayout.displayName = 'AutomationLayout'
