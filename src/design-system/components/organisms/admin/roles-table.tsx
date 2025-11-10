import * as React from 'react';
import { Typography } from '@/design-system/components/atoms/Typography/Typography';

export interface RolesTableProps {
  roles: any[];
}

export const RolesTable: React.FC<RolesTableProps> = ({ roles }) => {
  return (
    <div>
      {roles.map((item: any) => (
        <div key={item.id}>
          <Typography variant="body" as="div">{item.name || item.title || item.id}</Typography>
        </div>
      ))}
    </div>
  );
};
