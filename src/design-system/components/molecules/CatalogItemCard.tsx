import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { GeometricIcon } from '../atoms/GeometricIcon';
import styles from './CatalogItemCard.module.css';

export interface CatalogItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  make?: string | null;
  model?: string | null;
  image_url?: string | null;
  thumbnail_url?: string | null;
  available_quantity: number | null;
  total_quantity: number | null;
  tags?: string[] | null;
}

interface CatalogItemCardProps {
  item: CatalogItem;
  onClick?: () => void;
  className?: string;
}

export const CatalogItemCard: React.FC<CatalogItemCardProps> = ({
  item,
  onClick,
  className,
}) => {
  const isAvailable = (item.available_quantity ?? 0) > 0;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isAvailable && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <div
      role="button"
      tabIndex={isAvailable ? 0 : -1}
      onClick={isAvailable ? onClick : undefined}
      onKeyDown={handleKeyDown}
      aria-disabled={!isAvailable}
      className={cn(
        'group relative flex flex-col overflow-hidden',
        'border-3 border-black bg-white',
        'transition-all duration-300',
        isAvailable && 'cursor-pointer hover:scale-105 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]',
        !isAvailable && 'opacity-60',
        className
      )}
    >
      {/* Image */}
      <div className={styles.fullWidth}>
        {item.image_url ? (
          <Image
            src={item.image_url}
            alt={item.name}
            fill
            className={styles.container}
          />
        ) : (
          <div className={styles.row}>
            <GeometricIcon name="package" size="xl" className={styles.text} />
          </div>
        )}

        {/* Availability Badge */}
        <div className={styles.card}>
          {isAvailable ? (
            <div className={styles.card}>
              <span className={styles.container}>
                {item.available_quantity} AVAILABLE
              </span>
            </div>
          ) : (
            <div className={styles.card}>
              <span className={styles.container}>
                UNAVAILABLE
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className={styles.section}>
        <h3 className={styles.container}>
          {item.name}
        </h3>

        {item.make && item.model && (
          <p className={styles.text}>
            {item.make} {item.model}
          </p>
        )}

        <p className={styles.text}>
          {item.description}
        </p>

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className={styles.container}>
            {item.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className={styles.card}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Add to Cart Button */}
        <button
          type="button"
          disabled={!isAvailable}
          className={cn(
            'mt-4 flex items-center justify-center gap-2',
            'border-3 border-black px-4 py-3',
            'font-bebas-neue text-sm uppercase tracking-wide',
            'transition-colors duration-200',
            isAvailable
              ? 'bg-white text-black hover:bg-black hover:text-white'
              : 'cursor-not-allowed bg-grey-300 text-grey-600'
          )}
        >
          {isAvailable ? (
            <>
              ADD TO ADVANCE
              <GeometricIcon name="plus" size="sm" />
            </>
          ) : (
            'UNAVAILABLE'
          )}
        </button>
      </div>
    </div>
  );
};
