/**
 * BudgetLineItem Component
 * GHXSTSHIP Entertainment Platform - Budget line item display
 */

import * as React from 'react'
import styles from './BudgetLineItem.module.css'

export interface BudgetLineItemProps {
  name: string
  category: string
  budgetedAmount: number
  actualAmount?: number
  variance?: number
  status?: 'planned' | 'approved' | 'committed' | 'invoiced' | 'paid' | 'cancelled'
  vendorName?: string
  onEdit?: () => void
  onDelete?: () => void
  className?: string
}

export const BudgetLineItem: React.FC<BudgetLineItemProps> = ({
  name,
  category,
  budgetedAmount,
  actualAmount = 0,
  variance = 0,
  status = 'planned',
  vendorName,
  onEdit,
  onDelete,
  className = '',
}) => {
  const variancePercent = budgetedAmount > 0 ? (variance / budgetedAmount) * 100 : 0
  const isOverBudget = variance > 0

  return (
    <div className={`${styles.lineItem} ${className}`}>
      <div className={styles.main}>
        <div className={styles.info}>
          <span className={styles.name}>{name}</span>
          <span className={styles.category}>{category}</span>
          {vendorName && <span className={styles.vendor}>{vendorName}</span>}
        </div>

        <div className={styles.amounts}>
          <div className={styles.amountGroup}>
            <span className={styles.label}>Budgeted</span>
            <span className={styles.amount}>${budgetedAmount.toFixed(2)}</span>
          </div>

          <div className={styles.amountGroup}>
            <span className={styles.label}>Actual</span>
            <span className={styles.amount}>${actualAmount.toFixed(2)}</span>
          </div>

          <div className={`${styles.amountGroup} ${styles.variance}`}>
            <span className={styles.label}>Variance</span>
            <span className={`${styles.amount} ${isOverBudget ? styles.over : styles.under}`}>
              {variance >= 0 ? '+' : ''}${variance.toFixed(2)} ({variancePercent.toFixed(1)}%)
            </span>
          </div>
        </div>

        <div className={styles.status}>
          <span className={`${styles.statusBadge} ${styles[status]}`}>
            {status.replace('_', ' ')}
          </span>
        </div>
      </div>

      {(onEdit || onDelete) && (
        <div className={styles.actions}>
          {onEdit && (
            <button className={styles.actionButton} onClick={onEdit}>
              Edit
            </button>
          )}
          {onDelete && (
            <button className={`${styles.actionButton} ${styles.delete}`} onClick={onDelete}>
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  )
}

BudgetLineItem.displayName = 'BudgetLineItem'
