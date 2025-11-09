import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { GeometricIcon } from '../atoms/GeometricIcon';

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
          <div className="flex h-full items-center justify-center">
            <GeometricIcon name="package" size="md" className="text-grey-400" />
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col justify-center">
        <h4 className="font-bebas-neue text-base uppercase leading-tight">
          {item.name}
        </h4>

        {item.make && item.model && (
          <p className="mt-0.5 font-share-tech-mono text-xs text-grey-600">
            {item.make} {item.model}
          </p>
        )}

        <div className="mt-1 flex items-center gap-2">
          <span className="font-share-tech-mono text-xs text-grey-700">
            Qty: {item.quantity}
          </span>

          {item.modifiers && item.modifiers.length > 0 && (
            <>
              <span className="text-grey-400">•</span>
              <span className="font-share-tech-mono text-xs text-grey-600">
                {item.modifiers.map((m) => m.name).join(', ')}
              </span>
            </>
          )}
        </div>

        {item.notes && (
          <p className="mt-1 font-share-tech text-xs italic text-grey-600">
            {item.notes}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-2">
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="flex h-8 w-8 items-center justify-center border-2 border-black bg-white transition-colors hover:bg-black hover:text-white"
            aria-label="Edit item"
          >
            <GeometricIcon name="edit" size="sm" />
          </button>
        )}

        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="flex h-8 w-8 items-center justify-center border-2 border-black bg-white transition-colors hover:bg-black hover:text-white"
            aria-label="Remove item"
          >
            <GeometricIcon name="trash" size="sm" />
          </button>
        )}
      </div>
    </div>
  );
};
