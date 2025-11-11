'use client';

import React from 'react';
import Link from 'next/link';
import styles from './OrganizationCard.module.css';
import { OrganizationBadge } from '../../atoms/OrganizationBadge';
import type { Organization } from '@/types/super-expansion';

export interface OrganizationCardProps {
  organization: Organization;
  href?: string;
  className?: string;
}

export const OrganizationCard: React.FC<OrganizationCardProps> = ({
  organization,
  href,
  className,
}) => {
  const content = (
    <div className={`${styles.card} ${className || ''}`}>
      <div className={styles.header}>
        <h3 className={styles.name}>{organization.organization_name}</h3>
        {organization.organization_type && (
          <OrganizationBadge type={organization.organization_type} />
        )}
      </div>

      <div className={styles.meta}>
        {organization.city && organization.state && (
          <span className={styles.location}>
            {organization.city}, {organization.state}
          </span>
        )}
        {organization.primary_email && (
          <span className={styles.email}>{organization.primary_email}</span>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className={styles.link}>
        {content}
      </Link>
    );
  }

  return content;
};

OrganizationCard.displayName = 'OrganizationCard';
