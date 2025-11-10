/**
 * TransactionHistory Component
 * GHXSTSHIP Entertainment Platform - Financial transaction history
 */

'use client'

import * as React from 'react'
import { useState } from 'react'
import styles from './TransactionHistory.module.css'

export interface Transaction {
  id: string
  transactionNumber: string
  type: 'ticket_sale' | 'merchandise' | 'food_beverage' | 'parking' | 'sponsorship' | 'vendor_payment' | 'refund'
  customerName?: string
  amount: number
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
  date: Date
  paymentMethod?: string
}

export interface TransactionHistoryProps {
  transactions: Transaction[]
  totalRevenue: number
  totalExpenses: number
  onTransactionClick?: (transactionId: string) => void
  className?: string
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  transactions,
  totalRevenue,
  totalExpenses,
  onTransactionClick,
  className = '',
}) => {
  const [filter, setFilter] = useState<'all' | 'revenue' | 'expenses'>('all')

  const revenueTypes = ['ticket_sale', 'merchandise', 'food_beverage', 'parking', 'sponsorship']
  const expenseTypes = ['vendor_payment', 'refund']

  const filteredTransactions = transactions.filter(t => {
    if (filter === 'revenue') return revenueTypes.includes(t.type)
    if (filter === 'expenses') return expenseTypes.includes(t.type)
    return true
  })

  const netProfit = totalRevenue - totalExpenses

  return (
    <div className={`${styles.history} ${className}`}>
      <div className={styles.header}>
        <h2 className={styles.title}>Transaction History</h2>
      </div>

      <div className={styles.summary}>
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Total Revenue</span>
          <span className={styles.summaryValue}>${totalRevenue.toFixed(2)}</span>
        </div>

        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Total Expenses</span>
          <span className={styles.summaryValue}>${totalExpenses.toFixed(2)}</span>
        </div>

        <div className={`${styles.summaryCard} ${styles.profit}`}>
          <span className={styles.summaryLabel}>Net Profit</span>
          <span className={`${styles.summaryValue} ${netProfit >= 0 ? styles.positive : styles.negative}`}>
            ${netProfit.toFixed(2)}
          </span>
        </div>
      </div>

      <div className={styles.filters}>
        <button
          className={`${styles.filterButton} ${filter === 'all' ? styles.active : ''}`}
          onClick={() => setFilter('all')}
        >
          All Transactions
        </button>
        <button
          className={`${styles.filterButton} ${filter === 'revenue' ? styles.active : ''}`}
          onClick={() => setFilter('revenue')}
        >
          Revenue
        </button>
        <button
          className={`${styles.filterButton} ${filter === 'expenses' ? styles.active : ''}`}
          onClick={() => setFilter('expenses')}
        >
          Expenses
        </button>
      </div>

      <div className={styles.table}>
        <div className={styles.tableHeader}>
          <span className={styles.columnHeader}>Transaction</span>
          <span className={styles.columnHeader}>Customer</span>
          <span className={styles.columnHeader}>Amount</span>
          <span className={styles.columnHeader}>Status</span>
          <span className={styles.columnHeader}>Date</span>
        </div>

        <div className={styles.tableBody}>
          {filteredTransactions.map(transaction => {
            const isNegative = expenseTypes.includes(transaction.type)

            return (
              <div
                key={transaction.id}
                className={styles.transaction}
                onClick={() => onTransactionClick?.(transaction.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onTransactionClick?.(transaction.id);
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <div className={styles.cell}>
                  <span className={styles.transactionNumber}>{transaction.transactionNumber}</span>
                  <span className={styles.transactionType}>{transaction.type.replace('_', ' ')}</span>
                </div>

                <div className={styles.cell}>
                  <span>{transaction.customerName || '—'}</span>
                </div>

                <div className={styles.cell}>
                  <span className={`${styles.amount} ${isNegative ? styles.negative : styles.positive}`}>
                    {isNegative ? '-' : '+'}${Math.abs(transaction.amount).toFixed(2)}
                  </span>
                </div>

                <div className={styles.cell}>
                  <span className={`${styles.statusBadge} ${styles[transaction.status]}`}>
                    {transaction.status}
                  </span>
                </div>

                <div className={styles.cell}>
                  <span className={styles.date}>{transaction.date.toLocaleDateString()}</span>
                  {transaction.paymentMethod && (
                    <span className={styles.payment}>{transaction.paymentMethod}</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

TransactionHistory.displayName = 'TransactionHistory'
