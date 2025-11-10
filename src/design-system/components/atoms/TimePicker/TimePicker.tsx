/**
 * TimePicker Component
 * GHXSTSHIP Entertainment Platform - Time selection
 */

'use client'

import * as React from 'react'
import { useState } from 'react'
import styles from './TimePicker.module.css'

export interface TimePickerProps {
  value?: string
  onChange?: (time: string) => void
  disabled?: boolean
  placeholder?: string
  className?: string
  label?: string
  error?: string
  step?: number
}

export const TimePicker: React.FC<TimePickerProps> = ({
  value = '',
  onChange,
  disabled = false,
  placeholder = 'Select time',
  className = '',
  label,
  error,
  step = 60,
}) => {
  const [internalValue, setInternalValue] = useState(value)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const timeValue = e.target.value
    setInternalValue(timeValue)
    onChange?.(timeValue)
  }

  return (
    <div className={`${styles.container} ${className}`}>
      {label && <label className={styles.label}>{label}</label>}
      <input
        type="time"
        value={internalValue}
        onChange={handleChange}
        disabled={disabled}
        placeholder={placeholder}
        step={step}
        className={`${styles.input} ${error ? styles.error : ''}`}
      />
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  )
}

TimePicker.displayName = 'TimePicker'
