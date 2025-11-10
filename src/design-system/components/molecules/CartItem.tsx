import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { GeometricIcon } from '../atoms/GeometricIcon';
import styles from './CartItem.module.css';

export interface CartItemData {
  id: string;
  catalog_item_id: string;
  name: string;
  make?: string | null;
  model?: string | null;
  quantity: number;
  thumbnail_url?: string | null;
  modifiers?: Array<{ name: string; value?: string }>;
  notes?: string | null;
}

interface CartItemProps {
  item: CartItemData;
  onEdit?: () => void;
  onRemove?: () => void;
  compact?: boolean;
  className?: string;
}

export const CartItem: React.FC<CartItemProps> = ({
  item,
  onEdit,
  onRemove,
  compact = false,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex gap-4 border-b-2 border-grey-200 bg-white',
        compact ? 'p-3' : 'p-4',
        className
      )}
    >
      {/* Thumbnail */}
      <div
        className={cn(
          'relative shrink-0 overflow-hidden border-2 border-black bg-grey-100',
          compact ? 'h-16 w-16' : 'h-20 w-20'
        )}
      >
        {item.thumbnail_url ? (
          <Image
            src={item.thumbnail_url}
            alt={item.name}
            fill
            className="object-cover grayscale"
          />
        ) : (
          <div className={styles.row}>
            <GeometricIcon name="package" size="md" className={styles.text} />
          </div>
        )}
      </div>

      {/* Details */}
      <div className={styles.section}>
        <h4 className={styles.container}>
          {item.name}
        </h4>

        {item.make && item.model && (
          <p className={styles.text}>
            {item.make} {item.model}
          </p>
        )}

        <div className={styles.row}>
          <span className={styles.text}>
            Qty: {item.quantity}
          </span>

          {item.modifiers && item.modifiers.length > 0 && (
            <>
              <span className={styles.text}>•</span>
              <span className={styles.text}>
                {item.modifiers.map((m) => m.name).join(', ')}
              </span>
            </>
          )}
        </div>

        {item.notes && (
          <p className={styles.text}>
            {item.notes}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className={styles.row}>
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className={styles.iconLarge}
            aria-label="Edit item"
          >
            <GeometricIcon name="edit" size="sm" />
          </button>
        )}

        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className={styles.iconLarge}
            aria-label="Remove item"
          >
            <GeometricIcon name="trash" size="sm" />
          </button>
        )}
      </div>
    </div>
  );
};
