/**
 * Pagination - Page navigation molecule
 * GHXSTSHIP Atomic Design System
 */

import { Button, Stack, Text } from '../../atoms';
import styles from './Pagination.module.css';

export interface PaginationProps {
  /** Current page (1-indexed) */
  currentPage: number;
  /** Total pages */
  totalPages: number;
  /** Page change handler */
  onPageChange: (page: number) => void;
  /** Show page numbers */
  showPageNumbers?: boolean;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showPageNumbers = true,
}: PaginationProps) {
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <nav className={styles.pagination} aria-label="Pagination">
      <Stack direction="horizontal" gap={2} align="center">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!canGoPrevious}
          aria-label="Previous page"
        >
          Previous
        </Button>

        {showPageNumbers && (
          <Stack direction="horizontal" gap={1} className={styles.pageNumbers}>
            {getPageNumbers().map((page, index) => {
              if (page === '...') {
                return (
                  <span key={`ellipsis-${index}`} className={styles.ellipsis}>
                    <Text font="bebas">...</Text>
                  </span>
                );
              }

              return (
                <button
                  key={page}
                  onClick={() => onPageChange(page as number)}
                  className={`${styles.pageButton} ${
                    page === currentPage ? styles.active : ''
                  }`}
                  aria-label={`Page ${page}`}
                  aria-current={page === currentPage ? 'page' : undefined}
                >
                  <Text font="bebas">{page}</Text>
                </button>
              );
            })}
          </Stack>
        )}

        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!canGoNext}
          aria-label="Next page"
        >
          Next
        </Button>
      </Stack>
    </nav>
  );
}
