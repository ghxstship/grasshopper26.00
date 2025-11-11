'use client';

import React from 'react';
import styles from './OrganizationBadge.module.css';
import type { OrganizationType } from '@/types/super-expansion';

export interface OrganizationBadgeProps {
  type: OrganizationType;
  className?: string;
}

const typeLabels: Record<OrganizationType, string> = {
  production_company: 'PRODUCTION',
  venue: 'VENUE',
  promoter: 'PROMOTER',
  artist_management: 'ARTIST MGMT',
  vendor: 'VENDOR',
};

export const OrganizationBadge: React.FC<OrganizationBadgeProps> = ({
  type,
  className,
}) => {
  return (
    <span className={`${styles.badge} ${styles[type]} ${className || ''}`}>
      {typeLabels[type]}
    </span>
  );
};

OrganizationBadge.displayName = 'OrganizationBadge';
