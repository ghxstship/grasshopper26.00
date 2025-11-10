/**
 * Slider Component
 * GHXSTSHIP Entertainment Platform - Range slider
 * Geometric slider with hard edges for price/time filtering
 */

'use client';

import * as React from 'react';
import styles from './Slider.module.css';

export interface SliderProps {
  min?: number;
  max?: number;
  step?: number;
  value?: number | number[];
  defaultValue?: number | number[];
  onChange?: (value: number | number[]) => void;
  label?: string;
  showValue?: boolean;
  disabled?: boolean;
  className?: string;
}

export const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  (
    {
      min = 0,
      max = 100,
      step = 1,
      value: controlledValue,
      defaultValue = min,
      onChange,
      label,
      showValue = false,
      disabled = false,
      className = '',
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = React.useState<number | number[]>(
      controlledValue ?? defaultValue
    );

    const value = controlledValue ?? internalValue;
    const isRange = Array.isArray(value);

    const handleChange = (newValue: number, index?: number) => {
      if (isRange && typeof index === 'number') {
        const newRange = [...(value as number[])];
        newRange[index] = newValue;
        setInternalValue(newRange);
        onChange?.(newRange);
      } else {
        setInternalValue(newValue);
        onChange?.(newValue);
      }
    };

    const getPercentage = (val: number) => ((val - min) / (max - min)) * 100;

    const containerClassNames = [
      styles.container,
      className,
    ].filter(Boolean).join(' ');

    const trackClassNames = [
      styles.track,
      disabled && styles.disabled,
    ].filter(Boolean).join(' ');

    return (
      <div ref={ref} className={containerClassNames}>
        {(label || showValue) && (
          <div className={styles.header}>
            {label && <span className={styles.label}>{label}</span>}
            {showValue && (
              <span className={styles.value}>
                {isRange
                  ? `${(value as number[])[0]} - ${(value as number[])[1]}`
                  : value}
              </span>
            )}
          </div>
        )}

        <div className={trackClassNames}>
          {isRange ? (
            <>
              <div
                className={styles.range}
                style={{
                  left: `${getPercentage((value as number[])[0])}%`,
                  width: `${getPercentage((value as number[])[1]) - getPercentage((value as number[])[0])}%`,
                }}
              />
              <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={(value as number[])[0]}
                onChange={(e) => handleChange(Number(e.target.value), 0)}
                disabled={disabled}
                className={styles.input}
                aria-label={`${label} minimum`}
              />
              <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={(value as number[])[1]}
                onChange={(e) => handleChange(Number(e.target.value), 1)}
                disabled={disabled}
                className={styles.input}
                aria-label={`${label} maximum`}
              />
            </>
          ) : (
            <>
              <div
                className={styles.fill}
                style={{ width: `${getPercentage(value as number)}%` }}
              />
              <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value as number}
                onChange={(e) => handleChange(Number(e.target.value))}
                disabled={disabled}
                className={styles.input}
                aria-label={label}
              />
            </>
          )}
        </div>
      </div>
    );
  }
);

Slider.displayName = 'Slider';
