import * as React from "react"
import { ChevronRight, Home } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import styles from './breadcrumb.module.css'

export interface BreadcrumbItem {
  label: string
  href?: string
  icon?: React.ReactNode
}

export interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[]
  separator?: React.ReactNode
  showHome?: boolean
  homeHref?: string
}

const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
  ({ items, separator, showHome = true, homeHref = "/", className, ...props }, ref) => {
    const allItems = showHome
      ? [{ label: "Home", href: homeHref, icon: <Home className={styles.homeIcon} /> }, ...items]
      : items

    return (
      <nav
        ref={ref}
        aria-label="Breadcrumb"
        className={cn(styles.nav, className)}
        {...props}
      >
        <ol className={styles.list}>
          {allItems.map((item, index) => {
            const isLast = index === allItems.length - 1

            return (
              <li key={index} className={styles.item}>
                {index > 0 && (
                  <span className={styles.separator} aria-hidden="true">
                    {separator || <ChevronRight className={styles.separatorIcon} />}
                  </span>
                )}
                {item.href && !isLast ? (
                  <Link
                    href={item.href}
                    className={styles.link}
                  >
                    {item.icon && <span className={styles.iconWrapper}>{item.icon}</span>}
                    <span>{item.label}</span>
                  </Link>
                ) : (
                  <span
                    className={isLast ? styles.current : styles.link}
                    aria-current={isLast ? "page" : undefined}
                  >
                    {item.icon && <span className={styles.iconWrapper}>{item.icon}</span>}
                    <span>{item.label}</span>
                  </span>
                )}
              </li>
            )
          })}
        </ol>
      </nav>
    )
  }
)

Breadcrumb.displayName = "Breadcrumb"

export { Breadcrumb }
