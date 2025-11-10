'use client';

import React, { useState } from 'react';
import styles from './FilterPanel.module.css';

export interface FilterOption {
  id: string;
  label: string;
  count?: number;
}

export interface FilterGroup {
  id: string;
  title: string;
  type: 'checkbox' | 'range';
  options?: FilterOption[];
  min?: number;
  max?: number;
}

export interface FilterPanelProps {
  /** Filter groups */
  groups: FilterGroup[];
  /** Selected filters */
  selectedFilters?: Record<string, string[]>;
  /** Range values */
  rangeValues?: Record<string, { min: number; max: number }>;
  /** Filter change handler */
  onFilterChange?: (groupId: string, values: string[]) => void;
  /** Range change handler */
  onRangeChange?: (groupId: string, min: number, max: number) => void;
  /** Clear all filters */
  onClearAll?: () => void;
  /** Apply filters */
  onApply?: () => void;
  /** Additional CSS class */
  className?: string;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  groups,
  selectedFilters = {},
  rangeValues = {},
  onFilterChange,
  onRangeChange,
  onClearAll,
  onApply,
  className = '',
}) => {
  const [localRanges, setLocalRanges] = useState<Record<string, { min: string; max: string }>>(
    Object.entries(rangeValues).reduce((acc, [key, value]) => ({
      ...acc,
      [key]: { min: value.min.toString(), max: value.max.toString() },
    }), {})
  );

  const handleCheckboxChange = (groupId: string, optionId: string) => {
    const currentValues = selectedFilters[groupId] || [];
    const newValues = currentValues.includes(optionId)
      ? currentValues.filter((id) => id !== optionId)
      : [...currentValues, optionId];
    
    onFilterChange?.(groupId, newValues);
  };

  const handleRangeInputChange = (groupId: string, field: 'min' | 'max', value: string) => {
    setLocalRanges((prev) => ({
      ...prev,
      [groupId]: {
        ...prev[groupId],
        [field]: value,
      },
    }));
  };

  const handleRangeApply = (groupId: string) => {
    const range = localRanges[groupId];
    if (range) {
      const min = parseFloat(range.min) || 0;
      const max = parseFloat(range.max) || 0;
      onRangeChange?.(groupId, min, max);
    }
  };

  return (
    <div className={`${styles.panel} ${className}`}>
      <div className={styles.header}>
        <h3 className={styles.title}>FILTERS</h3>
        {onClearAll && (
          <button className={styles.clearButton} onClick={onClearAll}>
            CLEAR ALL
          </button>
        )}
      </div>

      <div className={styles.groups}>
        {groups.map((group) => (
          <div key={group.id} className={styles.group}>
            <h4 className={styles.groupTitle}>{group.title}</h4>

            {group.type === 'checkbox' && group.options && (
              <div className={styles.options}>
                {group.options.map((option) => (
                  <label key={option.id} className={styles.option}>
                    <input
                      type="checkbox"
                      className={styles.checkbox}
                      checked={selectedFilters[group.id]?.includes(option.id) || false}
                      onChange={() => handleCheckboxChange(group.id, option.id)}
                    />
                    <span className={styles.label}>{option.label}</span>
                    {option.count !== undefined && (
                      <span className={styles.count}>({option.count})</span>
                    )}
                  </label>
                ))}
              </div>
            )}

            {group.type === 'range' && (
              <div className={styles.rangeGroup}>
                <div className={styles.rangeInputs}>
                  <input
                    type="number"
                    className={styles.rangeInput}
                    placeholder="MIN"
                    value={localRanges[group.id]?.min || ''}
                    onChange={(e) => handleRangeInputChange(group.id, 'min', e.target.value)}
                    min={group.min}
                    max={group.max}
                  />
                  <span className={styles.rangeSeparator}>—</span>
                  <input
                    type="number"
                    className={styles.rangeInput}
                    placeholder="MAX"
                    value={localRanges[group.id]?.max || ''}
                    onChange={(e) => handleRangeInputChange(group.id, 'max', e.target.value)}
                    min={group.min}
                    max={group.max}
                  />
                </div>
                <button
                  className={styles.clearButton}
                  onClick={() => handleRangeApply(group.id)}
                >
                  APPLY RANGE
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {onApply && (
        <button className={styles.applyButton} onClick={onApply}>
          APPLY FILTERS
        </button>
      )}
    </div>
  );
};

FilterPanel.displayName = 'FilterPanel';
