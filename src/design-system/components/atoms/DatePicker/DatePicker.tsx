/**
 * DatePicker Component
 * GHXSTSHIP Entertainment Platform - Date selection
 */

'use client'

import * as React from 'react'
import { useState } from 'react'
import styles from './DatePicker.module.css'

export interface DatePickerProps {
  value?: Date
  onChange?: (date: Date | null) => void
  min?: Date
  max?: Date
  disabled?: boolean
  placeholder?: string
  className?: string
  label?: string
  error?: string
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  min,
  max,
  disabled = false,
  placeholder = 'Select date',
  className = '',
  label,
  error,
}) => {
  const [internalValue, setInternalValue] = useState(value ? formatDate(value) : '')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value
    setInternalValue(dateValue)
    
    if (dateValue) {
      const date = new Date(dateValue)
      onChange?.(date)
    } else {
      onChange?.(null)
    }
  }

  return (
    <div className={`${styles.container} ${className}`}>
      {label && <label className={styles.label}>{label}</label>}
      <input
        type="date"
        value={internalValue}
        onChange={handleChange}
        min={min ? formatDate(min) : undefined}
        max={max ? formatDate(max) : undefined}
        disabled={disabled}
        placeholder={placeholder}
        className={`${styles.input} ${error ? styles.error : ''}`}
      />
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  )
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

DatePicker.displayName = 'DatePicker'
