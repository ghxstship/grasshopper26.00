/**
 * VendorManagement Component
 * GHXSTSHIP Entertainment Platform - Vendor management interface
 */

'use client'

import * as React from 'react'
import { useState } from 'react'
import styles from './VendorManagement.module.css'

export interface Vendor {
  id: string
  vendorName: string
  category: string
  contactName?: string
  email?: string
  phone?: string
  rating?: number
  totalProjects?: number
  status: 'prospective' | 'active' | 'inactive' | 'blacklisted'
  isPreferred?: boolean
}

export interface VendorManagementProps {
  vendors: Vendor[]
  onVendorClick?: (vendorId: string) => void
  onAddVendor?: () => void
  className?: string
}

export const VendorManagement: React.FC<VendorManagementProps> = ({
  vendors,
  onVendorClick,
  onAddVendor,
  className = '',
}) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'preferred'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredVendors = vendors.filter(vendor => {
    const matchesFilter =
      filter === 'all' ||
      (filter === 'active' && vendor.status === 'active') ||
      (filter === 'preferred' && vendor.isPreferred)

    const matchesSearch =
      !searchTerm ||
      vendor.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.category.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesFilter && matchesSearch
  })

  const categories = Array.from(new Set(vendors.map(v => v.category)))

  return (
    <div className={`${styles.management} ${className}`}>
      <div className={styles.header}>
        <h2 className={styles.title}>Vendor Management</h2>
        {onAddVendor && (
          <button className={styles.addButton} onClick={onAddVendor}>
            + Add Vendor
          </button>
        )}
      </div>

      <div className={styles.controls}>
        <input
          type="text"
          placeholder="Search vendors..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className={styles.search}
        />

        <div className={styles.filters}>
          <button
            className={`${styles.filterButton} ${filter === 'all' ? styles.active : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({vendors.length})
          </button>
          <button
            className={`${styles.filterButton} ${filter === 'active' ? styles.active : ''}`}
            onClick={() => setFilter('active')}
          >
            Active ({vendors.filter(v => v.status === 'active').length})
          </button>
          <button
            className={`${styles.filterButton} ${filter === 'preferred' ? styles.active : ''}`}
            onClick={() => setFilter('preferred')}
          >
            Preferred ({vendors.filter(v => v.isPreferred).length})
          </button>
        </div>
      </div>

      <div className={styles.grid}>
        {filteredVendors.map(vendor => (
          <div
            key={vendor.id}
            className={styles.vendor}
            onClick={() => onVendorClick?.(vendor.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onVendorClick?.(vendor.id);
              }
            }}
            role="button"
            tabIndex={0}
          >
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>
                <h3 className={styles.vendorName}>{vendor.vendorName}</h3>
                <span className={styles.category}>{vendor.category}</span>
              </div>

              <div className={styles.badges}>
                {vendor.isPreferred && (
                  <span className={styles.preferred}>★ Preferred</span>
                )}
                <span className={`${styles.status} ${styles[vendor.status]}`}>
                  {vendor.status}
                </span>
              </div>
            </div>

            {(vendor.contactName || vendor.email || vendor.phone) && (
              <div className={styles.contact}>
                {vendor.contactName && (
                  <div className={styles.contactName}>{vendor.contactName}</div>
                )}
                {vendor.email && <div className={styles.contactDetail}>{vendor.email}</div>}
                {vendor.phone && <div className={styles.contactDetail}>{vendor.phone}</div>}
              </div>
            )}

            <div className={styles.stats}>
              <div className={styles.stat}>
                <span className={styles.statLabel}>Rating</span>
                <span className={styles.statValue}>
                  {vendor.rating ? `${vendor.rating.toFixed(1)}/5.0` : 'N/A'}
                </span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statLabel}>Projects</span>
                <span className={styles.statValue}>{vendor.totalProjects || 0}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredVendors.length === 0 && (
        <div className={styles.empty}>
          <span>No vendors found</span>
          {onAddVendor && (
            <button className={styles.emptyButton} onClick={onAddVendor}>
              Add First Vendor
            </button>
          )}
        </div>
      )}
    </div>
  )
}

VendorManagement.displayName = 'VendorManagement'
