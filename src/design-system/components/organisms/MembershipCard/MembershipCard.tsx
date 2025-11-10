/**
 * MembershipCard Organism
 * GHXSTSHIP Monochromatic Design System
 */

import * as React from "react";
import { Typography } from '../../atoms/Typography/Typography';
import styles from './MembershipCard.module.css';

export interface MembershipCardProps {
  membership: any;
  profile: any;
}

export const MembershipCard: React.FC<MembershipCardProps> = ({
  membership,
  profile,
}) => {
  if (!membership) {
    return (
      <div className={styles.card}>
        <Typography variant="h3" as="div">
          Join GVTEWAY Membership
        </Typography>
        <Typography variant="body" as="p">
          Unlock exclusive benefits and experiences
        </Typography>
      </div>
    );
  }
  
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.badge}>
          {membership.membership_tiers?.tier_level || 0}
        </div>
        <Typography variant="h4" as="div">
          GVTEWAY
        </Typography>
      </div>
      
      <div className={styles.content}>
        <Typography variant="h3" as="div" className={styles.name}>
          {profile?.display_name || 'Member'}
        </Typography>
        <Typography variant="meta" as="div" className={styles.tier}>
          {membership.membership_tiers?.display_name || 'Member'}
        </Typography>
      </div>
      
      <div className={styles.footer}>
        <Typography variant="meta" as="div">
          Member Since {new Date(membership.start_date).getFullYear()}
        </Typography>
        <div className={styles.qr}>QR</div>
      </div>
    </div>
  );
};
