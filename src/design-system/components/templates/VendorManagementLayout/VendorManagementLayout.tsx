/**
 * VendorManagementLayout Template
 * GHXSTSHIP Entertainment Platform - Vendor management layout
 */

import * as React from 'react'
import styles from './VendorManagementLayout.module.css'

export interface VendorManagementLayoutProps {
  header: React.ReactNode
  sidebar?: React.ReactNode
  vendorGrid: React.ReactNode
  contracts?: React.ReactNode
  footer?: React.ReactNode
  className?: string
}

export const VendorManagementLayout: React.FC<VendorManagementLayoutProps> = ({
  header,
  sidebar,
  vendorGrid,
  contracts,
  footer,
  className = '',
}) => {
  return (
    <div className={`${styles.layout} ${className}`}>
      {header && <header className={styles.header}>{header}</header>}

      <div className={styles.main}>
        {sidebar && <aside className={styles.sidebar}>{sidebar}</aside>}

        <div className={styles.content}>
          <section className={styles.vendors}>{vendorGrid}</section>

          {contracts && (
            <section className={styles.contracts}>{contracts}</section>
          )}
        </div>
      </div>

      {footer && <footer className={styles.footer}>{footer}</footer>}
    </div>
  )
}

VendorManagementLayout.displayName = 'VendorManagementLayout'
