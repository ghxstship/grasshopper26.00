/**
 * Pagination Component
 * GHXSTSHIP Entertainment Platform - Page Navigation
 * Geometric buttons with BEBAS NEUE labels
 */

import * as React from 'react';
import styles from './Pagination.module.css';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  maxVisible?: number;
  className?: string;
}

export const Pagination = React.forwardRef<HTMLElement, PaginationProps>(
  ({ currentPage, totalPages, onPageChange, maxVisible = 5, className = '' }, ref) => {
    const getPageNumbers = () => {
      const pages: (number | string)[] = [];
      
      if (totalPages <= maxVisible) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        const leftSiblingIndex = Math.max(currentPage - 1, 1);
        const rightSiblingIndex = Math.min(currentPage + 1, totalPages);
        
        const shouldShowLeftDots = leftSiblingIndex > 2;
        const shouldShowRightDots = rightSiblingIndex < totalPages - 1;
        
        pages.push(1);
        
        if (shouldShowLeftDots) {
          pages.push('...');
        }
        
        for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
          if (i !== 1 && i !== totalPages) {
            pages.push(i);
          }
        }
        
        if (shouldShowRightDots) {
          pages.push('...');
        }
        
        if (totalPages > 1) {
          pages.push(totalPages);
        }
      }
      
      return pages;
    };

    const classNames = [
      styles.pagination,
      className,
    ].filter(Boolean).join(' ');

    return (
      <nav ref={ref} className={classNames} aria-label="Pagination">
        <button
          className={styles.button}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
        >
          <span className={styles.arrow}>←</span>
          <span className={styles.label}>PREV</span>
        </button>

        <div className={styles.pages}>
          {getPageNumbers().map((page, index) => {
            if (page === '...') {
              return (
                <span key={`dots-${index}`} className={styles.dots}>
                  ...
                </span>
              );
            }

            const pageNumber = page as number;
            const isActive = pageNumber === currentPage;

            return (
              <button
                key={pageNumber}
                className={`${styles.pageButton} ${isActive ? styles.active : ''}`}
                onClick={() => onPageChange(pageNumber)}
                aria-label={`Page ${pageNumber}`}
                aria-current={isActive ? 'page' : undefined}
              >
                {pageNumber}
              </button>
            );
          })}
        </div>

        <button
          className={styles.button}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next page"
        >
          <span className={styles.label}>NEXT</span>
          <span className={styles.arrow}>→</span>
        </button>
      </nav>
    );
  }
);

Pagination.displayName = 'Pagination';
