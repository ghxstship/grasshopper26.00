/**
 * Table Component
 * GHXSTSHIP Entertainment Platform - Data table
 * Thick borders, geometric grid
 */

import * as React from 'react'
import styles from './Table.module.css'

export interface TableColumn {
  key: string
  header: string
  width?: string
}

export interface TableProps {
  columns: TableColumn[]
  data: Record<string, any>[]
  striped?: boolean
  className?: string
}

export const Table: React.FC<TableProps> = ({
  columns,
  data,
  striped = false,
  className = '',
}) => {
  return (
    <div className={`${styles.tableWrapper} ${className}`}>
      <table className={`${styles.table} ${striped ? styles.striped : ''}`}>
        <thead className={styles.thead}>
          <tr>
            {columns.map(column => (
              <th
                key={column.key}
                className={styles.th}
                style={{ width: column.width }}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={styles.tbody}>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className={styles.tr}>
              {columns.map(column => (
                <td key={column.key} className={styles.td}>
                  {row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

Table.displayName = 'Table'
