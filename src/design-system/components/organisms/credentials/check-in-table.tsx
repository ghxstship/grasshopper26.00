import * as React from 'react';
import { Typography } from '@/design-system/components/atoms/Typography/Typography';

export interface CheckInTableProps {
  checkIns: any[];
}

export const CheckInTable: React.FC<CheckInTableProps> = ({ checkIns }) => {
  return (
    <div>
      {checkIns.map((checkIn: any) => (
        <div key={checkIn.id}>
          <Typography variant="body" as="div">{checkIn.name}</Typography>
        </div>
      ))}
    </div>
  );
};
