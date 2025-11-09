import React from 'react';
import { cn } from '@/lib/utils';
import { Minus, Plus } from 'lucide-react';

interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  compact?: boolean;
  className?: string;
}

export const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  value,
  onChange,
  min = 1,
  max = 99,
  compact = false,
  className,
}) => {
  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    if (!isNaN(newValue) && newValue >= min && newValue <= max) {
      onChange(newValue);
    }
  };

  return (
    <div
      className={cn(
        'inline-flex items-center border-3 border-black bg-white',
        compact ? 'gap-2' : 'gap-4',
        className
      )}
    >
      <button
        type="button"
        onClick={handleDecrement}
        disabled={value <= min}
        className={cn(
          'flex items-center justify-center transition-colors',
          'hover:bg-black hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-black',
          compact ? 'h-8 w-8' : 'h-12 w-12'
        )}
        aria-label="Decrease quantity"
      >
        <Minus className={compact ? 'h-4 w-4' : 'h-5 w-5'} />
      </button>

      <input
        type="number"
        value={value}
        onChange={handleInputChange}
        min={min}
        max={max}
        className={cn(
          'w-12 bg-transparent text-center font-bebas-neue outline-none',
          compact ? 'text-lg' : 'text-2xl'
        )}
        aria-label="Quantity"
      />

      <button
        type="button"
        onClick={handleIncrement}
        disabled={value >= max}
        className={cn(
          'flex items-center justify-center transition-colors',
          'hover:bg-black hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-black',
          compact ? 'h-8 w-8' : 'h-12 w-12'
        )}
        aria-label="Increase quantity"
      >
        <Plus className={compact ? 'h-4 w-4' : 'h-5 w-5'} />
      </button>
    </div>
  );
};
