"use client"

import { Breadcrumb } from "@/components/ui/breadcrumb"
import { useBreadcrumbs } from "@/hooks/use-breadcrumbs"

export function AdminBreadcrumbs() {
  const items = useBreadcrumbs()
  
  if (items.length === 0) {
    return null
  }
  
  return (
    <div className="mb-6">
      <Breadcrumb items={items} showHome={false} />
    </div>
  )
}
