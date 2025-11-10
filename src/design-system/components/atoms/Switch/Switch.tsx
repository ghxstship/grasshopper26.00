/**
 * Switch Component
 * GHXSTSHIP Entertainment Platform - Toggle switch
 * Geometric square toggle with hard edges
 */

'use client'

import * as React from 'react'
import { useState } from 'react'
import styles from './Switch.module.css'

export interface SwitchProps {
  checked?: boolean
  defaultChecked?: boolean
  onChange?: (checked: boolean) => void
  disabled?: boolean
  label?: string
  className?: string
  id?: string
}

export const Switch: React.FC<SwitchProps> = ({
  checked: controlledChecked,
  defaultChecked = false,
  onChange,
  disabled = false,
  label,
  className = '',
  id,
}) => {
  const [internalChecked, setInternalChecked] = useState(defaultChecked)
  const isControlled = controlledChecked !== undefined
  const checked = isControlled ? controlledChecked : internalChecked

  const generatedId = React.useId()
  const switchId = id || `switch-${generatedId}`

  const handleChange = () => {
    if (disabled) return

    const newChecked = !checked
    if (!isControlled) {
      setInternalChecked(newChecked)
    }
    onChange?.(newChecked)
  }

  return (
    <div className={`${styles.container} ${className}`}>
      <button
        id={switchId}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        className={`${styles.switch} ${checked ? styles.checked : ''} ${disabled ? styles.disabled : ''}`}
        onClick={handleChange}
      >
        <span className={styles.thumb} />
      </button>
      {label && (
        <label htmlFor={switchId} className={styles.label}>
          {label}
        </label>
      )}
    </div>
  )
}

Switch.displayName = 'Switch'
