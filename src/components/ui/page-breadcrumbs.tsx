"use client"

import { Breadcrumb } from "@/components/ui/breadcrumb"
import { useBreadcrumbs } from "@/hooks/use-breadcrumbs"
import { cn } from "@/lib/utils"

interface PageBreadcrumbsProps {
  className?: string
  showHome?: boolean
}

export function PageBreadcrumbs({ className, showHome = true }: PageBreadcrumbsProps) {
  const items = useBreadcrumbs()
  
  if (items.length === 0) {
    return null
  }
  
  return (
    <div className={cn("mb-6", className)}>
      <Breadcrumb items={items} showHome={showHome} />
    </div>
  )
}
