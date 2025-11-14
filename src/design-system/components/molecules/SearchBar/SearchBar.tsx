/**
 * SearchBar - Search input molecule
 * GHXSTSHIP Atomic Design System
 */

'use client';

import { useState } from 'react';
import { Input, Button, Stack } from '../../atoms';
import styles from './SearchBar.module.css';

export interface SearchBarProps {
  /** Placeholder text */
  placeholder?: string;
  /** Initial value */
  value?: string;
  /** Change handler */
  onChange?: (value: string) => void;
  /** Submit handler */
  onSubmit?: (value: string) => void;
  /** Full width */
  fullWidth?: boolean;
}

export function SearchBar({
  placeholder = 'Search...',
  value: controlledValue,
  onChange,
  onSubmit,
  fullWidth,
}: SearchBarProps) {
  const [internalValue, setInternalValue] = useState('');
  const value = controlledValue !== undefined ? controlledValue : internalValue;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (controlledValue === undefined) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(value);
  };

  return (
    <form onSubmit={handleSubmit} className={fullWidth ? styles.fullWidth : undefined}>
      <Stack direction="horizontal" gap={2}>
        <Input
          type="search"
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          fullWidth={fullWidth}
        />
        {onSubmit && (
          <Button type="submit" variant="primary">
            Search
          </Button>
        )}
      </Stack>
    </form>
  );
}
