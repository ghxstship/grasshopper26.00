/**
 * ReferralsList Organism
 * GHXSTSHIP Design System
 */

import React from 'react';
import styles from './ReferralsList.module.css';

export interface Referral {
  id: string;
  name: string;
  email: string;
  status: string;
  date: string;
}

export interface ReferralsListProps {
  referrals: Referral[];
}

export function ReferralsList({ referrals }: ReferralsListProps) {
  return (
    <div className={styles.list}>
      {referrals.map((referral) => (
        <div key={referral.id} className={styles.item}>
          <div className={styles.info}>
            <h3 className={styles.name}>{referral.name}</h3>
            <p className={styles.email}>{referral.email}</p>
          </div>
          <div className={styles.meta}>
            <span className={styles.status}>{referral.status}</span>
            <span className={styles.date}>{referral.date}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
