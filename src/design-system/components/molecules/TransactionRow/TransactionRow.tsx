/**
 * TransactionRow Component
 * GHXSTSHIP Entertainment Platform - Transaction display row
 */

import * as React from 'react'
import styles from './TransactionRow.module.css'

export interface TransactionRowProps {
  transactionNumber: string
  type: 'ticket_sale' | 'merchandise' | 'food_beverage' | 'parking' | 'sponsorship' | 'vendor_payment' | 'refund'
  customerName?: string
  amount: number
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
  date: Date
  paymentMethod?: string
  onClick?: () => void
  className?: string
}

export const TransactionRow: React.FC<TransactionRowProps> = ({
  transactionNumber,
  type,
  customerName,
  amount,
  status,
  date,
  paymentMethod,
  onClick,
  className = '',
}) => {
  const isNegative = type === 'vendor_payment' || type === 'refund'

  return (
    <div 
      className={`${styles.row} ${onClick ? styles.clickable : ''} ${className}`}
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
      <div className={styles.id}>
        <span className={styles.number}>{transactionNumber}</span>
        <span className={styles.type}>{type.replace('_', ' ')}</span>
      </div>

      {customerName && (
        <div className={styles.customer}>{customerName}</div>
      )}

      <div className={styles.amount}>
        <span className={`${styles.value} ${isNegative ? styles.negative : styles.positive}`}>
          {isNegative ? '-' : '+'}${Math.abs(amount).toFixed(2)}
        </span>
      </div>

      <div className={styles.status}>
        <span className={`${styles.statusBadge} ${styles[status]}`}>
          {status}
        </span>
      </div>

      <div className={styles.meta}>
        <span className={styles.date}>{date.toLocaleDateString()}</span>
        {paymentMethod && (
          <span className={styles.payment}>{paymentMethod}</span>
        )}
      </div>
    </div>
  )
}

TransactionRow.displayName = 'TransactionRow'
