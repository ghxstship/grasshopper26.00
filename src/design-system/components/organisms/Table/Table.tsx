/**
 * Table - Data table organism
 * GHXSTSHIP Atomic Design System
 */

import { Text } from '../../atoms';
import styles from './Table.module.css';

export interface TableColumn<T> {
  /** Column header */
  header: string;
  /** Accessor function */
  accessor: (row: T) => React.ReactNode;
  /** Column width */
  width?: string;
}

export interface TableProps<T> {
  /** Table columns */
  columns: TableColumn<T>[];
  /** Table data */
  data: T[];
  /** Loading state */
  loading?: boolean;
  /** Empty message */
  emptyMessage?: string;
}

export function Table<T>({
  columns,
  data,
  loading,
  emptyMessage = 'No data available',
}: TableProps<T>) {
  if (loading) {
    return (
      <div className={styles.table}>
        <Text align="center" color="secondary">
          Loading...
        </Text>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={styles.table}>
        <Text align="center" color="secondary">
          {emptyMessage}
        </Text>
      </div>
    );
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead className={styles.thead}>
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                className={styles.th}
                style={column.width ? { width: column.width } : undefined}
              >
                <Text font="bebas" size="lg" uppercase>
                  {column.header}
                </Text>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={styles.tbody}>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className={styles.tr}>
              {columns.map((column, colIndex) => (
                <td key={colIndex} className={styles.td}>
                  {column.accessor(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
