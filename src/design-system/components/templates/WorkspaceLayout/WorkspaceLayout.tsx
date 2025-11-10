/**
 * WorkspaceLayout Template
 * GHXSTSHIP Entertainment Platform - Multi-view workspace layout
 */

import * as React from 'react'
import styles from './WorkspaceLayout.module.css'

export interface WorkspaceLayoutProps {
  header: React.ReactNode
  sidebar?: React.ReactNode
  toolbar?: React.ReactNode
  mainContent: React.ReactNode
  rightPanel?: React.ReactNode
  footer?: React.ReactNode
  className?: string
}

export const WorkspaceLayout: React.FC<WorkspaceLayoutProps> = ({
  header,
  sidebar,
  toolbar,
  mainContent,
  rightPanel,
  footer,
  className = '',
}) => {
  return (
    <div className={`${styles.layout} ${className}`}>
      {header && <header className={styles.header}>{header}</header>}

      <div className={styles.main}>
        {sidebar && <aside className={styles.sidebar}>{sidebar}</aside>}

        <div className={styles.content}>
          {toolbar && <div className={styles.toolbar}>{toolbar}</div>}
          
          <div className={styles.workspace}>{mainContent}</div>
        </div>

        {rightPanel && <aside className={styles.rightPanel}>{rightPanel}</aside>}
      </div>

      {footer && <footer className={styles.footer}>{footer}</footer>}
    </div>
  )
}

WorkspaceLayout.displayName = 'WorkspaceLayout'
