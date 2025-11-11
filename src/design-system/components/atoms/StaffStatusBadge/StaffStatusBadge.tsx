'use client';

import React from 'react';
import styles from './StaffStatusBadge.module.css';
import type { AssignmentStatus } from '@/types/super-expansion';

export interface StaffStatusBadgeProps {
  status: AssignmentStatus;
  className?: string;
}

const statusLabels: Record<AssignmentStatus, string> = {
  scheduled: 'SCHEDULED',
  confirmed: 'CONFIRMED',
  checked_in: 'CHECKED IN',
  on_break: 'ON BREAK',
  checked_out: 'CHECKED OUT',
  no_show: 'NO SHOW',
  cancelled: 'CANCELLED',
};

export const StaffStatusBadge: React.FC<StaffStatusBadgeProps> = ({
  status,
  className,
}) => {
  return (
    <span className={`${styles.badge} ${styles[status]} ${className || ''}`}>
      {statusLabels[status]}
    </span>
  );
};

StaffStatusBadge.displayName = 'StaffStatusBadge';
