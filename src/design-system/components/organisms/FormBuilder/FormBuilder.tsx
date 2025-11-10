/**
 * FormBuilder Component
 * GHXSTSHIP Entertainment Platform - Dynamic form builder
 */

'use client'

import * as React from 'react'
import { useState } from 'react'
import styles from './FormBuilder.module.css'

export interface FormField {
  id: string
  type: 'text' | 'email' | 'number' | 'select' | 'textarea' | 'checkbox' | 'date'
  label: string
  placeholder?: string
  required?: boolean
  options?: string[]
  value?: any
}

export interface FormBuilderProps {
  fields: FormField[]
  onSubmit?: (data: Record<string, any>) => void
  onFieldChange?: (fieldId: string, value: any) => void
  submitLabel?: string
  className?: string
}

export const FormBuilder: React.FC<FormBuilderProps> = ({
  fields,
  onSubmit,
  onFieldChange,
  submitLabel = 'Submit',
  className = '',
}) => {
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {}
    fields.forEach(field => {
      initial[field.id] = field.value || ''
    })
    return initial
  })

  const handleChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }))
    onFieldChange?.(fieldId, value)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit?.(formData)
  }

  const renderField = (field: FormField) => {
    switch (field.type) {
      case 'select':
        return (
          <select
            id={field.id}
            value={formData[field.id]}
            onChange={e => handleChange(field.id, e.target.value)}
            required={field.required}
            className={styles.select}
          >
            <option value="">Select...</option>
            {field.options?.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        )

      case 'textarea':
        return (
          <textarea
            id={field.id}
            value={formData[field.id]}
            onChange={e => handleChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            className={styles.textarea}
            rows={4}
          />
        )

      case 'checkbox':
        return (
          <input
            type="checkbox"
            id={field.id}
            checked={formData[field.id]}
            onChange={e => handleChange(field.id, e.target.checked)}
            className={styles.checkbox}
          />
        )

      default:
        return (
          <input
            type={field.type}
            id={field.id}
            value={formData[field.id]}
            onChange={e => handleChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            className={styles.input}
          />
        )
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`${styles.form} ${className}`}>
      {fields.map(field => (
        <div key={field.id} className={styles.fieldGroup}>
          <label htmlFor={field.id} className={styles.label}>
            {field.label}
            {field.required && <span className={styles.required}>*</span>}
          </label>
          {renderField(field)}
        </div>
      ))}

      <button type="submit" className={styles.submitButton}>
        {submitLabel}
      </button>
    </form>
  )
}

FormBuilder.displayName = 'FormBuilder'
