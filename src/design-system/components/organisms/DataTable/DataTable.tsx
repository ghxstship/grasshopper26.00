/**
 * DataTable Component
 * GHXSTSHIP Entertainment Platform - Advanced data table with sorting, filtering, and inline editing
 */

'use client'

import * as React from 'react'
import { useState } from 'react'
import styles from './DataTable.module.css'

export interface Column {
  id: string
  label: string
  type?: 'text' | 'number' | 'date' | 'select' | 'boolean'
  sortable?: boolean
  editable?: boolean
  width?: number
  options?: string[]
}

export interface Row {
  id: string
  [key: string]: any
}

export interface DataTableProps {
  columns: Column[]
  rows: Row[]
  onSort?: (columnId: string, direction: 'asc' | 'desc') => void
  onEdit?: (rowId: string, columnId: string, value: any) => void
  onRowClick?: (rowId: string) => void
  onAddRow?: () => void
  selectable?: boolean
  onSelectionChange?: (selectedIds: string[]) => void
  className?: string
}

export const DataTable: React.FC<DataTableProps> = ({
  columns,
  rows,
  onSort,
  onEdit,
  onRowClick,
  onAddRow,
  selectable = false,
  onSelectionChange,
  className = '',
}) => {
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [editingCell, setEditingCell] = useState<{ rowId: string; columnId: string } | null>(null)

  const handleSort = (columnId: string) => {
    const newDirection = sortColumn === columnId && sortDirection === 'asc' ? 'desc' : 'asc'
    setSortColumn(columnId)
    setSortDirection(newDirection)
    onSort?.(columnId, newDirection)
  }

  const handleSelectAll = () => {
    if (selectedRows.size === rows.length) {
      setSelectedRows(new Set())
      onSelectionChange?.([])
    } else {
      const allIds = new Set(rows.map(r => r.id))
      setSelectedRows(allIds)
      onSelectionChange?.(Array.from(allIds))
    }
  }

  const handleSelectRow = (rowId: string) => {
    const newSelected = new Set(selectedRows)
    if (newSelected.has(rowId)) {
      newSelected.delete(rowId)
    } else {
      newSelected.add(rowId)
    }
    setSelectedRows(newSelected)
    onSelectionChange?.(Array.from(newSelected))
  }

  const handleCellEdit = (rowId: string, columnId: string, value: any) => {
    onEdit?.(rowId, columnId, value)
    setEditingCell(null)
  }

  return (
    <div className={`${styles.container} ${className}`}>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr>
              {selectable && (
                <th className={styles.checkboxCell}>
                  <input
                    type="checkbox"
                    checked={selectedRows.size === rows.length && rows.length > 0}
                    onChange={handleSelectAll}
                    className={styles.checkbox}
                  />
                </th>
              )}
              {columns.map(column => (
                <th
                  key={column.id}
                  className={`${styles.th} ${column.sortable ? styles.sortable : ''}`}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && handleSort(column.id)}
                >
                  <div className={styles.thContent}>
                    <span className={styles.columnLabel}>{column.label}</span>
                    {column.sortable && sortColumn === column.id && (
                      <span className={styles.sortIcon}>
                        {sortDirection === 'asc' ? '▲' : '▼'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={styles.tbody}>
            {rows.map(row => (
              <tr
                key={row.id}
                className={`${styles.tr} ${selectedRows.has(row.id) ? styles.selected : ''}`}
              >
                {selectable && (
                  <td className={styles.checkboxCell}>
                    <input
                      type="checkbox"
                      checked={selectedRows.has(row.id)}
                      onChange={() => handleSelectRow(row.id)}
                      className={styles.checkbox}
                    />
                  </td>
                )}
                {columns.map(column => (
                  <td
                    key={column.id}
                    className={styles.td}
                  >
                    <div
                      className={styles.cell}
                      onClick={() => onRowClick?.(row.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onRowClick?.(row.id);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      {editingCell?.rowId === row.id && editingCell?.columnId === column.id ? (
                        <input
                          type="text"
                          defaultValue={row[column.id]}
                          onBlur={e => handleCellEdit(row.id, column.id, e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              handleCellEdit(row.id, column.id, (e.target as HTMLInputElement).value)
                            }
                          }}
                          className={styles.cellInput}
                        />
                      ) : (
                        <div
                          className={`${styles.cellContent} ${column.editable ? styles.editable : ''}`}
                          onClick={() => column.editable && setEditingCell({ rowId: row.id, columnId: column.id })}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              column.editable && setEditingCell({ rowId: row.id, columnId: column.id });
                            }
                          }}
                          role={column.editable ? "button" : undefined}
                          tabIndex={column.editable ? 0 : undefined}
                        >
                          {row[column.id]}
                        </div>
                      )}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {onAddRow && (
        <button className={styles.addButton} onClick={onAddRow}>
          + Add Row
        </button>
      )}
    </div>
  )
}

DataTable.displayName = 'DataTable'
