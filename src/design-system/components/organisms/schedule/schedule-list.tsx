import * as React from 'react';
import { Typography } from '@/design-system/components/atoms/Typography/Typography';

export interface ScheduleListProps {
  events: any[];
}

export const ScheduleList: React.FC<ScheduleListProps> = ({ events }) => {
  return (
    <div>
      {events.map((item: any) => (
        <div key={item.id}>
          <Typography variant="body" as="div">{item.name || item.title || item.id}</Typography>
        </div>
      ))}
    </div>
  );
};
