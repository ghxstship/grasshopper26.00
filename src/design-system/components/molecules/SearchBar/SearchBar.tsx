/**
 * SearchBar Component
 * GHXSTSHIP Entertainment Platform - Search Input
 * Bold outlined inputs (2-3px borders) with geometric icons
 */

import * as React from 'react';
import { Input } from '../../atoms/Input/Input';
import styles from './SearchBar.module.css';

export interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  className?: string;
  fullWidth?: boolean;
}

export const SearchBar = React.forwardRef<HTMLInputElement, SearchBarProps>(
  (
    {
      placeholder = 'SEARCH EVENTS, ARTISTS...',
      value: controlledValue,
      onChange,
      onSubmit,
      className = '',
      fullWidth = false,
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = React.useState('');
    const value = controlledValue !== undefined ? controlledValue : internalValue;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      if (controlledValue === undefined) {
        setInternalValue(newValue);
      }
      if (onChange) {
        onChange(newValue);
      }
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (onSubmit) {
        onSubmit(value);
      }
    };

    const handleClear = () => {
      const newValue = '';
      if (controlledValue === undefined) {
        setInternalValue(newValue);
      }
      if (onChange) {
        onChange(newValue);
      }
    };

    const containerClassNames = [
      styles.container,
      fullWidth && styles.fullWidth,
      className,
    ].filter(Boolean).join(' ');

    return (
      <form className={containerClassNames} onSubmit={handleSubmit}>
        <Input
          ref={ref}
          type="search"
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          fullWidth={fullWidth}
          className={styles.input}
          iconBefore={
            <span className={styles.searchIcon} aria-hidden="true">
              ◉
            </span>
          }
          iconAfter={
            value && (
              <button
                type="button"
                onClick={handleClear}
                className={styles.clearButton}
                aria-label="Clear search"
              >
                <span className={styles.clearIcon} aria-hidden="true">
                  ✕
                </span>
              </button>
            )
          }
        />
      </form>
    );
  }
);

SearchBar.displayName = 'SearchBar';
