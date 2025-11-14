/**
 * AdvanceCard - Advance display card organism
 * GHXSTSHIP Atomic Design System
 */

import { Card, Heading, Text, Button } from '../../atoms';
import styles from './advance-card.module.css';

export interface AdvanceCardProps {
  advance: {
    id: string;
    name: string;
    amount?: number;
    status?: string;
  };
  onClick?: () => void;
}

export function AdvanceCard({ advance, onClick }: AdvanceCardProps) {
  return (
    <Card>
      <div className={styles.content}>
        <Heading level={3}>{advance.name}</Heading>
        {advance.amount && (
          <Text size="lg" weight="medium">
            ${(advance.amount / 100).toLocaleString()}
          </Text>
        )}
        {advance.status && (
          <Text size="sm" color="secondary">
            Status: {advance.status}
          </Text>
        )}
        {onClick && (
          <Button variant="primary" size="sm" onClick={onClick}>
            View Details
          </Button>
        )}
      </div>
    </Card>
  );
}
