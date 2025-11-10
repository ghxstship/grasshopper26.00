/**
 * Breadcrumb Component
 * GHXSTSHIP Entertainment Platform - Navigation breadcrumbs
 * BEBAS NEUE uppercase with geometric separators
 */

import * as React from 'react'
import Link from 'next/link'
import styles from './Breadcrumb.module.css'

export interface BreadcrumbItem {
  label: string
  href?: string
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[]
  separator?: React.ReactNode
  className?: string
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  separator = '/',
  className = '',
}) => {
  return (
    <nav aria-label="Breadcrumb" className={`${styles.breadcrumb} ${className}`}>
      <ol className={styles.list}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1

          return (
            <li key={index} className={styles.item}>
              {item.href && !isLast ? (
                <Link href={item.href} className={styles.link}>
                  {item.label}
                </Link>
              ) : (
                <span className={styles.current} aria-current={isLast ? 'page' : undefined}>
                  {item.label}
                </span>
              )}
              {!isLast && <span className={styles.separator} aria-hidden="true">{separator}</span>}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

Breadcrumb.displayName = 'Breadcrumb'
