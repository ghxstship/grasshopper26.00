'use client';

import React from 'react';
import styles from './TicketTierBadge.module.css';
import type { TierType } from '@/types/super-expansion';

export interface TicketTierBadgeProps {
  tierType: TierType;
  className?: string;
}

const tierLabels: Record<TierType, string> = {
  general_admission: 'GA',
  vip: 'VIP',
  reserved_seating: 'RESERVED',
  early_bird: 'EARLY BIRD',
  group: 'GROUP',
  comp: 'COMP',
};

export const TicketTierBadge: React.FC<TicketTierBadgeProps> = ({
  tierType,
  className,
}) => {
  return (
    <span className={`${styles.badge} ${styles[tierType]} ${className || ''}`}>
      {tierLabels[tierType]}
    </span>
  );
};

TicketTierBadge.displayName = 'TicketTierBadge';
