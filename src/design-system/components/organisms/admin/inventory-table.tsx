import * as React from 'react';
import { Typography } from '@/design-system/components/atoms/Typography/Typography';

export interface InventoryTableProps {
  inventory: any[];
}

export const InventoryTable: React.FC<InventoryTableProps> = ({ inventory }) => {
  return (
    <div>
      {inventory.map((item: any) => (
        <div key={item.id}>
          <Typography variant="body" as="div">{item.name || item.title || item.id}</Typography>
        </div>
      ))}
    </div>
  );
};
