import * as React from 'react';
import styles from './StatusBadge.module.css';

export type StatusBadgeStatus = 
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'pending'
  | 'active'
  | 'inactive'
  | 'sold-out'
  | 'on-sale'
  | 'coming-soon'
  | 'live'
  | 'fulfilled' 
  | 'cancelled';

export type FulfillmentStatus = 
  | 'pending' 
  | 'assigned' 
  | 'fulfilled' 
  | 'unavailable';

export type AdvanceStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'fulfilled'
  | 'rejected'
  | 'cancelled';

export interface StatusBadgeProps {
  status: StatusBadgeStatus | FulfillmentStatus | AdvanceStatus;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const statusConfig: Record<string, { label: string; variant: string }> = {
  success: { label: 'SUCCESS', variant: 'success' },
  error: { label: 'ERROR', variant: 'error' },
  warning: { label: 'WARNING', variant: 'warning' },
  info: { label: 'INFO', variant: 'info' },
  pending: { label: 'PENDING', variant: 'pending' },
  active: { label: 'ACTIVE', variant: 'active' },
  inactive: { label: 'INACTIVE', variant: 'inactive' },
  'sold-out': { label: 'SOLD OUT', variant: 'soldOut' },
  'on-sale': { label: 'ON SALE', variant: 'onSale' },
  'coming-soon': { label: 'COMING SOON', variant: 'comingSoon' },
  live: { label: 'LIVE', variant: 'live' },
  fulfilled: { label: 'FULFILLED', variant: 'fulfilled' },
  cancelled: { label: 'CANCELLED', variant: 'cancelled' },
  draft: { label: 'DRAFT', variant: 'draft' },
  submitted: { label: 'SUBMITTED', variant: 'submitted' },
  under_review: { label: 'UNDER REVIEW', variant: 'underReview' },
  approved: { label: 'APPROVED', variant: 'approved' },
  rejected: { label: 'REJECTED', variant: 'rejected' },
  assigned: { label: 'ASSIGNED', variant: 'assigned' },
  unavailable: { label: 'UNAVAILABLE', variant: 'unavailable' },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  size = 'md',
  className = ''
}) => {
  const config = statusConfig[status] || statusConfig.draft;

  const classNames = [
    styles.badge,
    styles[config.variant],
    styles[size],
    className,
  ].filter(Boolean).join(' ');

  return (
    <span className={classNames}>
      {config.label}
    </span>
  );
};
