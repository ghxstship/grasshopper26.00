/**
 * StatusBadge - Status indicator badge atom
 * GHXSTSHIP Atomic Design System
 */

import styles from './StatusBadge.module.css';

export interface StatusBadgeProps {
  /** Status value */
  status: 
    | 'active' 
    | 'inactive' 
    | 'pending' 
    | 'completed' 
    | 'cancelled' 
    | 'confirmed' 
    | 'scheduled' 
    | 'in_progress' 
    | 'failed'
    | 'draft'
    | 'submitted'
    | 'under_review'
    | 'approved'
    | 'fulfilled'
    | 'rejected'
    | string; // Allow any string for flexibility
  /** Size */
  size?: 'sm' | 'md' | 'lg' | string;
  /** Additional className */
  className?: string;
  /** Children content */
  children?: React.ReactNode;
}

export function StatusBadge({
  status,
  size = 'md',
  className,
  children,
}: StatusBadgeProps) {
  const classNames = [
    styles.badge,
    styles[status],
    size && styles[`size-${size}`],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classNames}>
      {children || status.toUpperCase().replace('_', ' ')}
    </span>
  );
}
