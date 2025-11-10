/**
 * VendorCard Component
 * GHXSTSHIP Entertainment Platform - Vendor information card
 */

import * as React from 'react'
import styles from './VendorCard.module.css'

export interface VendorCardProps {
  vendorName: string
  category: string
  contactName?: string
  email?: string
  phone?: string
  rating?: number
  totalProjects?: number
  status?: 'prospective' | 'active' | 'inactive' | 'blacklisted'
  isPreferred?: boolean
  onClick?: () => void
  className?: string
}

export const VendorCard: React.FC<VendorCardProps> = ({
  vendorName,
  category,
  contactName,
  email,
  phone,
  rating = 0,
  totalProjects = 0,
  status = 'active',
  isPreferred = false,
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
        <div className={styles.title}>
          <h3 className={styles.name}>{vendorName}</h3>
          <span className={styles.category}>{category}</span>
        </div>
        
        <div className={styles.badges}>
          {isPreferred && (
            <span className={styles.preferred}>★ Preferred</span>
          )}
          <span className={`${styles.status} ${styles[status]}`}>
            {status}
          </span>
        </div>
      </div>

      {(contactName || email || phone) && (
        <div className={styles.contact}>
          {contactName && <div className={styles.contactName}>{contactName}</div>}
          {email && <div className={styles.contactDetail}>{email}</div>}
          {phone && <div className={styles.contactDetail}>{phone}</div>}
        </div>
      )}

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Rating</span>
          <span className={styles.statValue}>
            {rating > 0 ? `${rating.toFixed(1)}/5.0` : 'N/A'}
          </span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Projects</span>
          <span className={styles.statValue}>{totalProjects}</span>
        </div>
      </div>
    </div>
  )
}

VendorCard.displayName = 'VendorCard'
