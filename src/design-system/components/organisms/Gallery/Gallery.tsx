'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import styles from './Gallery.module.css';

export interface GalleryItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnailUrl?: string;
  caption?: string;
  meta?: string;
  alt?: string;
}

export interface GalleryProps {
  /** Gallery items */
  items: GalleryItem[];
  /** Grid layout variant */
  layout?: 'grid' | 'masonry';
  /** Show lightbox on click */
  enableLightbox?: boolean;
  /** Show load more button */
  showLoadMore?: boolean;
  /** Initial items to display */
  initialItemsCount?: number;
  /** Items to load per page */
  itemsPerPage?: number;
  /** Additional CSS class */
  className?: string;
}

export const Gallery: React.FC<GalleryProps> = ({
  items,
  layout = 'grid',
  enableLightbox = true,
  showLoadMore = false,
  initialItemsCount = 12,
  itemsPerPage = 12,
  className = '',
}) => {
  const [displayCount, setDisplayCount] = useState(initialItemsCount);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const displayedItems = showLoadMore ? items.slice(0, displayCount) : items;
  const hasMore = displayCount < items.length;

  const openLightbox = (index: number) => {
    if (enableLightbox) {
      setCurrentIndex(index);
      setLightboxOpen(true);
      document.body.style.overflow = 'hidden';
    }
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = '';
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
  };

  const loadMore = () => {
    setDisplayCount((prev) => Math.min(prev + itemsPerPage, items.length));
  };

  const gridClasses = [
    styles.grid,
    layout === 'masonry' && styles.masonry,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={`${styles.gallery} ${className}`}>
      <div className={gridClasses}>
        {displayedItems.map((item, index) => (
          <div
            key={item.id}
            className={styles.item}
            onClick={() => openLightbox(index)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openLightbox(index);
              }
            }}
            role="button"
            tabIndex={0}
          >
            <Image
              src={item.thumbnailUrl || item.url}
              alt={item.alt || item.caption || `Gallery item ${index + 1}`}
              fill
              className={styles.image}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            />
            {item.type === 'video' && (
              <div className={styles.videoIndicator}>▶</div>
            )}
            {(item.caption || item.meta) && (
              <div className={styles.overlay}>
                {item.caption && <h3 className={styles.caption}>{item.caption}</h3>}
                {item.meta && <p className={styles.meta}>{item.meta}</p>}
              </div>
            )}
          </div>
        ))}
      </div>

      {showLoadMore && hasMore && (
        <div className={styles.loadMore}>
          <button className={styles.loadMoreButton} onClick={loadMore}>
            LOAD MORE
          </button>
        </div>
      )}

      {lightboxOpen && (
        <div
          className={styles.lightbox}
          onClick={closeLightbox}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              closeLightbox();
            }
          }}
          role="button"
          tabIndex={0}
        >
          <div
            className={styles.lightboxContent}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {items[currentIndex].type === 'image' ? (
              <Image
                src={items[currentIndex].url}
                alt={items[currentIndex].alt || items[currentIndex].caption || ''}
                width={1200}
                height={800}
                className={styles.lightboxImage}
              />
            ) : (
              <video
                src={items[currentIndex].url}
                controls
                className={styles.lightboxVideo}
              >
                <track kind="captions" />
              </video>
            )}

            <button className={styles.lightboxClose} onClick={closeLightbox}>
              ✕
            </button>

            {items.length > 1 && (
              <>
                <button className={`${styles.lightboxNav} ${styles.lightboxPrev}`} onClick={goToPrevious}>
                  ←
                </button>
                <button className={`${styles.lightboxNav} ${styles.lightboxNext}`} onClick={goToNext}>
                  →
                </button>
              </>
            )}

            {items[currentIndex].caption && (
              <div className={styles.lightboxCaption}>
                {items[currentIndex].caption}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

Gallery.displayName = 'Gallery';
