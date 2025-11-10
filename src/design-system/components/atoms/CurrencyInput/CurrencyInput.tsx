/**
 * CurrencyInput Component
 * GHXSTSHIP Entertainment Platform - Currency input for budgets
 */

'use client'

import * as React from 'react'
import { useState } from 'react'
import styles from './CurrencyInput.module.css'

export interface CurrencyInputProps {
  value?: number
  onChange?: (value: number) => void
  currency?: string
  disabled?: boolean
  placeholder?: string
  className?: string
  label?: string
  error?: string
  min?: number
  max?: number
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  value = 0,
  onChange,
  currency = 'USD',
  disabled = false,
  placeholder = '0.00',
  className = '',
  label,
  error,
  min,
  max,
}) => {
  const [displayValue, setDisplayValue] = useState(formatCurrency(value))

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.replace(/[^0-9.]/g, '')
    setDisplayValue(inputValue)
    
    const numericValue = parseFloat(inputValue) || 0
    onChange?.(numericValue)
  }

  const handleBlur = () => {
    const numericValue = parseFloat(displayValue) || 0
    setDisplayValue(formatCurrency(numericValue))
  }

  const handleFocus = () => {
    setDisplayValue(value.toString())
  }

  return (
    <div className={`${styles.container} ${className}`}>
      {label && <label className={styles.label}>{label}</label>}
      
      <div className={styles.inputWrapper}>
        <span className={styles.currency}>{getCurrencySymbol(currency)}</span>
        <input
          type="text"
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          disabled={disabled}
          placeholder={placeholder}
          className={`${styles.input} ${error ? styles.error : ''}`}
        />
      </div>

      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  )
}

function formatCurrency(value: number): string {
  return value.toFixed(2)
}

function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
  }
  return symbols[currency] || currency
}

CurrencyInput.displayName = 'CurrencyInput'
