/**
 * MembershipTierCard Organism
 * GHXSTSHIP Monochromatic Design System
 */

import * as React from "react";
import { Typography } from '../../atoms/Typography/Typography';
import { Button } from '../../atoms/Button/Button';
import { Check } from 'lucide-react';
import styles from './MembershipTierCard.module.css';

export interface MembershipTierCardProps {
  tier: {
    id: string;
    tier_name: string;
    display_name: string;
    tier_level: number;
    annual_price: number;
    monthly_price: number;
    benefits: string[];
    featured?: boolean;
  };
  onClick?: () => void;
}

export const MembershipTierCard: React.FC<MembershipTierCardProps> = ({
  tier,
  onClick,
}) => {
  return (
    <div className={`${styles.card} ${tier.featured ? styles.featured : ''}`}>
      {tier.featured && (
        <div className={styles.badge}>
          Popular
        </div>
      )}
      
      <div className={styles.header}>
        <Typography variant="h3" as="h2">
          {tier.display_name}
        </Typography>
        <div className={styles.price}>
          <Typography variant="h2" as="div">
            ${tier.annual_price}
          </Typography>
          <Typography variant="meta" as="div">
            /year
          </Typography>
        </div>
        <Typography variant="body" as="div" className={styles.monthly}>
          or ${tier.monthly_price}/month
        </Typography>
      </div>
      
      <ul className={styles.benefits}>
        {tier.benefits?.map((benefit, index) => (
          <li key={index} className={styles.benefit}>
            <Check className={styles.checkIcon} />
            <span>{benefit}</span>
          </li>
        ))}
      </ul>
      
      <Button
        variant={tier.featured ? 'filled' : 'outlined'}
        fullWidth
        onClick={onClick}
      >
        Select Plan
      </Button>
    </div>
  );
};
