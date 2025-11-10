import React from 'react';
import styles from './StatusBadge.module.css';

export type AdvanceStatus = 
  | 'draft' 
  | 'submitted' 
  | 'under_review' 
  | 'approved' 
  | 'rejected' 
  | 'fulfilled' 
  | 'cancelled';

export type FulfillmentStatus = 
  | 'pending' 
  | 'assigned' 
  | 'fulfilled' 
  | 'unavailable';

interface StatusBadgeProps {
  status: AdvanceStatus | FulfillmentStatus;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  draft: {
    label: 'DRAFT',
    className: styles.draft,
  },
  submitted: {
    label: 'SUBMITTED',
    className: styles.submitted,
  },
  under_review: {
    label: 'UNDER REVIEW',
    className: styles.underReview,
  },
  approved: {
    label: 'APPROVED',
    className: styles.approved,
  },
  rejected: {
    label: 'REJECTED',
    className: styles.rejected,
  },
  fulfilled: {
    label: 'FULFILLED',
    className: styles.fulfilled,
  },
  cancelled: {
    label: 'CANCELLED',
    className: styles.cancelled,
  },
  pending: {
    label: 'PENDING',
    className: styles.pending,
  },
  assigned: {
    label: 'ASSIGNED',
    className: styles.assigned,
  },
  unavailable: {
    label: 'UNAVAILABLE',
    className: styles.unavailable,
  },
};

const sizeClasses = {
  sm: styles.badgeSm,
  md: styles.badgeMd,
  lg: styles.badgeLg,
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  size = 'md',
  className 
}) => {
  const config = statusConfig[status] || statusConfig.draft;

  return (
    <span
      className={`${styles.badge} ${config.className} ${sizeClasses[size]} ${className || ''}`}
    >
      {config.label}
    </span>
  );
};
