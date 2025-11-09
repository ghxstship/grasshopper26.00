import * as React from "react"
import { ChevronRight, Home } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

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
      ? [{ label: "Home", href: homeHref, icon: <Home className="h-4 w-4" /> }, ...items]
      : items

    return (
      <nav
        ref={ref}
        aria-label="Breadcrumb"
        className={cn("flex items-center space-x-1 text-sm text-muted-foreground", className)}
        {...props}
      >
        <ol className="flex items-center space-x-1">
          {allItems.map((item, index) => {
            const isLast = index === allItems.length - 1

            return (
              <li key={index} className="flex items-center space-x-1">
                {index > 0 && (
                  <span className="mx-2 text-muted-foreground/50" aria-hidden="true">
                    {separator || <ChevronRight className="h-4 w-4" />}
                  </span>
                )}
                {item.href && !isLast ? (
                  <Link
                    href={item.href}
                    className="flex items-center space-x-1 hover:text-foreground transition-colors"
                  >
                    {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                    <span>{item.label}</span>
                  </Link>
                ) : (
                  <span
                    className={cn(
                      "flex items-center space-x-1",
                      isLast && "text-foreground font-medium"
                    )}
                    aria-current={isLast ? "page" : undefined}
                  >
                    {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
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
