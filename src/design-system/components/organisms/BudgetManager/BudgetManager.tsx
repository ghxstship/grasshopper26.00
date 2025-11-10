/**
 * BudgetManager Component
 * GHXSTSHIP Entertainment Platform - Complete budget management interface
 */

'use client'

import * as React from 'react'
import { useState } from 'react'
import styles from './BudgetManager.module.css'

export interface BudgetLineItemData {
  id: string
  name: string
  category: string
  budgetedAmount: number
  actualAmount: number
  variance: number
  status: 'planned' | 'approved' | 'committed' | 'invoiced' | 'paid' | 'cancelled'
  vendorName?: string
}

export interface BudgetManagerProps {
  eventName: string
  totalBudgeted: number
  totalActual: number
  lineItems: BudgetLineItemData[]
  onAddItem?: () => void
  onEditItem?: (id: string) => void
  onDeleteItem?: (id: string) => void
  className?: string
}

export const BudgetManager: React.FC<BudgetManagerProps> = ({
  eventName,
  totalBudgeted,
  totalActual,
  lineItems,
  onAddItem,
  onEditItem,
  onDeleteItem,
  className = '',
}) => {
  const [filter, setFilter] = useState<'all' | 'revenue' | 'expense'>('all')
  const totalVariance = totalActual - totalBudgeted
  const variancePercent = totalBudgeted > 0 ? (totalVariance / totalBudgeted) * 100 : 0

  return (
    <div className={`${styles.manager} ${className}`}>
      <div className={styles.header}>
        <div className={styles.title}>
          <h2 className={styles.eventName}>{eventName}</h2>
          <span className={styles.subtitle}>Budget Management</span>
        </div>
        
        {onAddItem && (
          <button className={styles.addButton} onClick={onAddItem}>
            + Add Line Item
          </button>
        )}
      </div>

      <div className={styles.summary}>
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Budgeted</span>
          <span className={styles.summaryValue}>${totalBudgeted.toFixed(2)}</span>
        </div>
        
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Actual</span>
          <span className={styles.summaryValue}>${totalActual.toFixed(2)}</span>
        </div>
        
        <div className={`${styles.summaryCard} ${styles.variance}`}>
          <span className={styles.summaryLabel}>Variance</span>
          <span className={`${styles.summaryValue} ${totalVariance > 0 ? styles.over : styles.under}`}>
            {totalVariance >= 0 ? '+' : ''}${totalVariance.toFixed(2)}
            <span className={styles.percent}>({variancePercent.toFixed(1)}%)</span>
          </span>
        </div>
      </div>

      <div className={styles.filters}>
        <button 
          className={`${styles.filterButton} ${filter === 'all' ? styles.active : ''}`}
          onClick={() => setFilter('all')}
        >
          All Items
        </button>
        <button 
          className={`${styles.filterButton} ${filter === 'revenue' ? styles.active : ''}`}
          onClick={() => setFilter('revenue')}
        >
          Revenue
        </button>
        <button 
          className={`${styles.filterButton} ${filter === 'expense' ? styles.active : ''}`}
          onClick={() => setFilter('expense')}
        >
          Expenses
        </button>
      </div>

      <div className={styles.list}>
        {lineItems.length === 0 ? (
          <div className={styles.empty}>
            <span>No budget items yet</span>
            {onAddItem && (
              <button className={styles.emptyButton} onClick={onAddItem}>
                Add First Item
              </button>
            )}
          </div>
        ) : (
          lineItems.map(item => (
            <div key={item.id} className={styles.item}>
              <div className={styles.itemMain}>
                <div className={styles.itemInfo}>
                  <span className={styles.itemName}>{item.name}</span>
                  <span className={styles.itemCategory}>{item.category}</span>
                  {item.vendorName && <span className={styles.itemVendor}>{item.vendorName}</span>}
                </div>

                <div className={styles.itemAmounts}>
                  <div className={styles.itemAmount}>
                    <span className={styles.itemLabel}>Budgeted</span>
                    <span className={styles.itemValue}>${item.budgetedAmount.toFixed(2)}</span>
                  </div>
                  <div className={styles.itemAmount}>
                    <span className={styles.itemLabel}>Actual</span>
                    <span className={styles.itemValue}>${item.actualAmount.toFixed(2)}</span>
                  </div>
                  <div className={styles.itemAmount}>
                    <span className={styles.itemLabel}>Variance</span>
                    <span className={`${styles.itemValue} ${item.variance > 0 ? styles.over : styles.under}`}>
                      {item.variance >= 0 ? '+' : ''}${item.variance.toFixed(2)}
                    </span>
                  </div>
                </div>

                <span className={`${styles.itemStatus} ${styles[item.status]}`}>
                  {item.status.replace('_', ' ')}
                </span>
              </div>

              {(onEditItem || onDeleteItem) && (
                <div className={styles.itemActions}>
                  {onEditItem && (
                    <button onClick={() => onEditItem(item.id)}>Edit</button>
                  )}
                  {onDeleteItem && (
                    <button onClick={() => onDeleteItem(item.id)}>Delete</button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

BudgetManager.displayName = 'BudgetManager'
