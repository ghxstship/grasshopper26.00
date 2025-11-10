/**
 * GalleryView Component
 * GHXSTSHIP Entertainment Platform - Grid-based gallery view
 */

'use client'

import * as React from 'react'
import { useState } from 'react'
import styles from './GalleryView.module.css'

export interface GalleryItem {
  id: string
  title: string
  imageUrl?: string
  description?: string
  metadata?: Record<string, any>
  tags?: string[]
}

export interface GalleryViewProps {
  items: GalleryItem[]
  onItemClick?: (itemId: string) => void
  columns?: 2 | 3 | 4 | 5
  showSearch?: boolean
  className?: string
}

export const GalleryView: React.FC<GalleryViewProps> = ({
  items,
  onItemClick,
  columns = 4,
  showSearch = true,
  className = '',
}) => {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredItems = items.filter(item =>
    !searchQuery ||
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className={`${styles.container} ${className}`}>
      {showSearch && (
        <div className={styles.searchBar}>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search gallery..."
            className={styles.searchInput}
          />
        </div>
      )}

      <div className={`${styles.grid} ${styles[`columns${columns}`]}`}>
        {filteredItems.map(item => (
          <div
            key={item.id}
            className={styles.item}
            onClick={() => onItemClick?.(item.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onItemClick?.(item.id);
              }
            }}
            role="button"
            tabIndex={0}
          >
            {item.imageUrl && (
              <div className={styles.imageContainer}>
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className={styles.image}
                />
              </div>
            )}

            <div className={styles.content}>
              <h3 className={styles.title}>{item.title}</h3>
              
              {item.description && (
                <p className={styles.description}>{item.description}</p>
              )}

              {item.tags && item.tags.length > 0 && (
                <div className={styles.tags}>
                  {item.tags.map((tag, idx) => (
                    <span key={idx} className={styles.tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {item.metadata && (
                <div className={styles.metadata}>
                  {Object.entries(item.metadata).slice(0, 3).map(([key, value]) => (
                    <span key={key} className={styles.metaItem}>
                      {key}: {String(value)}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

GalleryView.displayName = 'GalleryView'
