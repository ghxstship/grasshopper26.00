/**
 * StatCard - Statistics display card molecule
 * GHXSTSHIP Atomic Design System
 */

import { Card, Stack, Heading, Text } from '../../atoms';

export interface StatCardProps {
  /** Stat label */
  label: string;
  /** Stat value */
  value: string | number;
  /** Change/trend */
  change?: string;
  /** Change is positive */
  changePositive?: boolean;
  /** Optional icon */
  icon?: React.ReactNode;
}

export function StatCard({
  label,
  value,
  change,
  changePositive,
  icon,
}: StatCardProps) {
  return (
    <Card variant="elevated" padding={6}>
      <Stack gap={2}>
        {icon && <div>{icon}</div>}
        <Text size="sm" color="secondary" uppercase>
          {label}
        </Text>
        <Heading level={2} font="anton">
          {value}
        </Heading>
        {change && (
          <Text size="sm" color={changePositive ? 'primary' : 'secondary'}>
            {change}
          </Text>
        )}
      </Stack>
    </Card>
  );
}
