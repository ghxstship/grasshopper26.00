/**
 * AdvancedFilter Component
 * GHXSTSHIP Entertainment Platform - Advanced filtering system
 */

'use client'

import * as React from 'react'
import { useState } from 'react'
import styles from './AdvancedFilter.module.css'

export interface FilterCondition {
  id: string
  field: string
  operator: 'equals' | 'contains' | 'greater' | 'less' | 'between' | 'in'
  value: any
}

export interface FilterGroup {
  id: string
  logic: 'AND' | 'OR'
  conditions: FilterCondition[]
}

export interface AdvancedFilterProps {
  fields: Array<{ id: string; label: string; type: 'text' | 'number' | 'date' | 'select' }>
  onApply?: (filters: FilterGroup[]) => void
  onClear?: () => void
  className?: string
}

export const AdvancedFilter: React.FC<AdvancedFilterProps> = ({
  fields,
  onApply,
  onClear,
  className = '',
}) => {
  const [filterGroups, setFilterGroups] = useState<FilterGroup[]>([
    { id: '1', logic: 'AND', conditions: [{ id: '1', field: '', operator: 'equals', value: '' }] }
  ])

  const addCondition = (groupId: string) => {
    setFilterGroups(groups =>
      groups.map(group =>
        group.id === groupId
          ? {
              ...group,
              conditions: [
                ...group.conditions,
                { id: Date.now().toString(), field: '', operator: 'equals', value: '' }
              ]
            }
          : group
      )
    )
  }

  const removeCondition = (groupId: string, conditionId: string) => {
    setFilterGroups(groups =>
      groups.map(group =>
        group.id === groupId
          ? { ...group, conditions: group.conditions.filter(c => c.id !== conditionId) }
          : group
      )
    )
  }

  const updateCondition = (groupId: string, conditionId: string, updates: Partial<FilterCondition>) => {
    setFilterGroups(groups =>
      groups.map(group =>
        group.id === groupId
          ? {
              ...group,
              conditions: group.conditions.map(c =>
                c.id === conditionId ? { ...c, ...updates } : c
              )
            }
          : group
      )
    )
  }

  const addGroup = () => {
    setFilterGroups([
      ...filterGroups,
      { id: Date.now().toString(), logic: 'AND', conditions: [{ id: '1', field: '', operator: 'equals', value: '' }] }
    ])
  }

  const handleApply = () => {
    onApply?.(filterGroups)
  }

  const handleClear = () => {
    setFilterGroups([
      { id: '1', logic: 'AND', conditions: [{ id: '1', field: '', operator: 'equals', value: '' }] }
    ])
    onClear?.()
  }

  return (
    <div className={`${styles.container} ${className}`}>
      <div className={styles.header}>
        <h3 className={styles.title}>Advanced Filters</h3>
        <div className={styles.actions}>
          <button className={styles.clearButton} onClick={handleClear}>
            Clear All
          </button>
          <button className={styles.applyButton} onClick={handleApply}>
            Apply Filters
          </button>
        </div>
      </div>

      <div className={styles.groups}>
        {filterGroups.map((group, groupIndex) => (
          <div key={group.id} className={styles.group}>
            {groupIndex > 0 && (
              <div className={styles.groupLogic}>
                <select
                  value={group.logic}
                  onChange={e => {
                    setFilterGroups(groups =>
                      groups.map(g => (g.id === group.id ? { ...g, logic: e.target.value as 'AND' | 'OR' } : g))
                    )
                  }}
                  className={styles.logicSelect}
                >
                  <option value="AND">AND</option>
                  <option value="OR">OR</option>
                </select>
              </div>
            )}

            <div className={styles.conditions}>
              {group.conditions.map((condition, conditionIndex) => (
                <div key={condition.id} className={styles.condition}>
                  {conditionIndex > 0 && (
                    <span className={styles.conditionLogic}>{group.logic}</span>
                  )}

                  <select
                    value={condition.field}
                    onChange={e => updateCondition(group.id, condition.id, { field: e.target.value })}
                    className={styles.fieldSelect}
                  >
                    <option value="">Select field...</option>
                    {fields.map(field => (
                      <option key={field.id} value={field.id}>
                        {field.label}
                      </option>
                    ))}
                  </select>

                  <select
                    value={condition.operator}
                    onChange={e => updateCondition(group.id, condition.id, { operator: e.target.value as any })}
                    className={styles.operatorSelect}
                  >
                    <option value="equals">Equals</option>
                    <option value="contains">Contains</option>
                    <option value="greater">Greater than</option>
                    <option value="less">Less than</option>
                    <option value="between">Between</option>
                    <option value="in">In</option>
                  </select>

                  <input
                    type="text"
                    value={condition.value}
                    onChange={e => updateCondition(group.id, condition.id, { value: e.target.value })}
                    placeholder="Value..."
                    className={styles.valueInput}
                  />

                  <button
                    className={styles.removeButton}
                    onClick={() => removeCondition(group.id, condition.id)}
                  >
                    ×
                  </button>
                </div>
              ))}

              <button className={styles.addCondition} onClick={() => addCondition(group.id)}>
                + Add Condition
              </button>
            </div>
          </div>
        ))}
      </div>

      <button className={styles.addGroup} onClick={addGroup}>
        + Add Filter Group
      </button>
    </div>
  )
}

AdvancedFilter.displayName = 'AdvancedFilter'
