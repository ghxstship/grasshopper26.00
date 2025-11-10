/**
 * Pagination Component
 * GHXSTSHIP Entertainment Platform - Page navigation
 */

import * as React from 'react'
import styles from './Pagination.module.css'

export interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  maxVisible?: number
  className?: string
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  maxVisible = 7,
  className = '',
}) => {
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)
      const leftSib = Math.max(currentPage - 1, 1)
      const rightSib = Math.min(currentPage + 1, totalPages)
      
      if (leftSib > 2) pages.push('...')
      for (let i = leftSib; i <= rightSib; i++) {
        if (i !== 1 && i !== totalPages) pages.push(i)
      }
      if (rightSib < totalPages - 1) pages.push('...')
      if (totalPages > 1) pages.push(totalPages)
    }
    
    return pages
  }

  return (
    <nav className={`${styles.pagination} ${className}`} aria-label="Pagination">
      <button
        className={styles.button}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        ←
      </button>
      
      {getPageNumbers().map((page, index) => (
        page === '...' ? (
          <span key={`dots-${index}`} className={styles.dots}>...</span>
        ) : (
          <button
            key={page}
            className={`${styles.button} ${page === currentPage ? styles.active : ''}`}
            onClick={() => onPageChange(page as number)}
          >
            {page}
          </button>
        )
      ))}
      
      <button
        className={styles.button}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        →
      </button>
    </nav>
  )
}

Pagination.displayName = 'Pagination'
