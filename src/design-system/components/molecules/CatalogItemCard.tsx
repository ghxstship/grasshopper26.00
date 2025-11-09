import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { GeometricIcon } from '../atoms/GeometricIcon';

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
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-grey-100">
        {item.image_url ? (
          <Image
            src={item.image_url}
            alt={item.name}
            fill
            className="object-cover grayscale transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <GeometricIcon name="package" size="xl" className="text-grey-400" />
          </div>
        )}

        {/* Availability Badge */}
        <div className="absolute right-4 top-4">
          {isAvailable ? (
            <div className="border-2 border-white bg-black px-3 py-1">
              <span className="font-share-tech-mono text-[10px] uppercase text-white">
                {item.available_quantity} AVAILABLE
              </span>
            </div>
          ) : (
            <div className="border-2 border-black bg-grey-400 px-3 py-1">
              <span className="font-share-tech-mono text-[10px] uppercase text-black">
                UNAVAILABLE
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-bebas-neue text-xl uppercase leading-tight">
          {item.name}
        </h3>

        {item.make && item.model && (
          <p className="mt-1 font-share-tech-mono text-xs text-grey-600">
            {item.make} {item.model}
          </p>
        )}

        <p className="mt-2 line-clamp-2 font-share-tech text-sm text-grey-700">
          {item.description}
        </p>

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {item.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="border-2 border-black px-2 py-1 font-share-tech-mono text-[10px] uppercase"
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
