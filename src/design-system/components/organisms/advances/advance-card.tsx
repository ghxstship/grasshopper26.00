import * as React from 'react';
import { Typography } from '@/design-system/components/atoms/Typography/Typography';

export interface AdvanceCardProps {
  advance: any;
}

export const AdvanceCard: React.FC<AdvanceCardProps> = ({ advance }) => {
  return (
    <div>
      <Typography variant="body" as="div">{advance.name || 'Advance'}</Typography>
    </div>
  );
};
