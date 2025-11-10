"use client"

import { Breadcrumb } from "@/design-system/components/molecules/breadcrumb"
import { useBreadcrumbs } from "@/hooks/use-breadcrumbs"
import styles from './AdminBreadcrumbs.module.css'

export function AdminBreadcrumbs() {
  const items = useBreadcrumbs()
  
  if (items.length === 0) {
    return null
  }
  
  return (
    <div className={styles.container}>
      <Breadcrumb items={items} showHome={false} />
    </div>
  )
}
