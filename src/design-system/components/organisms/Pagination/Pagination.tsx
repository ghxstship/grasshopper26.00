'use client';

import React from 'react';
import styles from './Pagination.module.css';

export interface PaginationProps {
  /** Current page (1-indexed) */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Page change handler */
  onPageChange: (page: number) => void;
  /** Number of page buttons to show */
  siblingCount?: number;
  /** Show page info */
  showInfo?: boolean;
  /** Total items count */
  totalItems?: number;
  /** Items per page */
  itemsPerPage?: number;
  /** Additional CSS class */
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  showInfo = false,
  totalItems,
  itemsPerPage,
  className = '',
}) => {
  const generatePageNumbers = () => {
    const pages: (number | string)[] = [];
    
    const leftSibling = Math.max(currentPage - siblingCount, 1);
    const rightSibling = Math.min(currentPage + siblingCount, totalPages);

    const showLeftEllipsis = leftSibling > 2;
    const showRightEllipsis = rightSibling < totalPages - 1;

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (showLeftEllipsis) {
        pages.push('...');
      }

      for (let i = leftSibling; i <= rightSibling; i++) {
        if (i !== 1 && i !== totalPages) {
          pages.push(i);
        }
      }

      if (showRightEllipsis) {
        pages.push('...');
      }

      pages.push(totalPages);
    }

    return pages;
  };

  const pages = generatePageNumbers();

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const startItem = totalItems && itemsPerPage ? (currentPage - 1) * itemsPerPage + 1 : null;
  const endItem = totalItems && itemsPerPage ? Math.min(currentPage * itemsPerPage, totalItems) : null;

  return (
    <nav className={`${styles.pagination} ${className}`} aria-label="Pagination">
      <button
        className={styles.button}
        onClick={handlePrevious}
        disabled={currentPage === 1}
        aria-label="Previous page"
      >
        ←
      </button>

      {pages.map((page, index) => {
        if (page === '...') {
          return (
            <span key={`ellipsis-${index}`} className={styles.ellipsis}>
              ...
            </span>
          );
        }

        return (
          <button
            key={page}
            className={`${styles.button} ${page === currentPage ? styles.active : ''}`}
            onClick={() => onPageChange(page as number)}
            aria-label={`Page ${page}`}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </button>
        );
      })}

      <button
        className={styles.button}
        onClick={handleNext}
        disabled={currentPage === totalPages}
        aria-label="Next page"
      >
        →
      </button>

      {showInfo && startItem && endItem && totalItems && (
        <span className={styles.info}>
          {startItem}-{endItem} OF {totalItems}
        </span>
      )}
    </nav>
  );
};

Pagination.displayName = 'Pagination';
