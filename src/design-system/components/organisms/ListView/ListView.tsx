/**
 * ListView Component
 * GHXSTSHIP Entertainment Platform - List view with grouping and filtering
 */

'use client'

import * as React from 'react'
import { useState } from 'react'
import styles from './ListView.module.css'

export interface ListItem {
  id: string
  title: string
  subtitle?: string
  description?: string
  metadata?: Record<string, any>
  group?: string
  tags?: string[]
}

export interface ListViewProps {
  items: ListItem[]
  onItemClick?: (itemId: string) => void
  groupBy?: string
  showSearch?: boolean
  showFilters?: boolean
  className?: string
}

export const ListView: React.FC<ListViewProps> = ({
  items,
  onItemClick,
  groupBy,
  showSearch = true,
  showFilters = false,
  className = '',
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)

  const filteredItems = items.filter(item => {
    const matchesSearch = !searchQuery || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesGroup = !selectedGroup || item.group === selectedGroup
    
    return matchesSearch && matchesGroup
  })

  const groups = groupBy ? Array.from(new Set(items.map(i => i.group).filter(Boolean))) : []

  const groupedItems = groupBy
    ? groups.reduce((acc, group) => {
        acc[group!] = filteredItems.filter(i => i.group === group)
        return acc
      }, {} as Record<string, ListItem[]>)
    : { all: filteredItems }

  return (
    <div className={`${styles.container} ${className}`}>
      {showSearch && (
        <div className={styles.searchBar}>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className={styles.searchInput}
          />
        </div>
      )}

      {showFilters && groups.length > 0 && (
        <div className={styles.filters}>
          <button
            className={`${styles.filterButton} ${!selectedGroup ? styles.active : ''}`}
            onClick={() => setSelectedGroup(null)}
          >
            All
          </button>
          {groups.map(group => (
            <button
              key={group}
              className={`${styles.filterButton} ${selectedGroup === group ? styles.active : ''}`}
              onClick={() => setSelectedGroup(group!)}
            >
              {group}
            </button>
          ))}
        </div>
      )}

      <div className={styles.list}>
        {Object.entries(groupedItems).map(([groupName, groupItems]) => (
          <div key={groupName} className={styles.group}>
            {groupBy && groupName !== 'all' && (
              <h3 className={styles.groupTitle}>{groupName}</h3>
            )}
            
            {groupItems.map(item => (
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
                <div className={styles.itemHeader}>
                  <h4 className={styles.itemTitle}>{item.title}</h4>
                  {item.subtitle && (
                    <span className={styles.itemSubtitle}>{item.subtitle}</span>
                  )}
                </div>

                {item.description && (
                  <p className={styles.itemDescription}>{item.description}</p>
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
                    {Object.entries(item.metadata).map(([key, value]) => (
                      <span key={key} className={styles.metaItem}>
                        {key}: {String(value)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

ListView.displayName = 'ListView'
