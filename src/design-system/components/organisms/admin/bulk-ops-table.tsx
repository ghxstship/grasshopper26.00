import * as React from 'react';
import { Typography } from '@/design-system/components/atoms/Typography/Typography';

export interface BulkOpsTableProps {
  operations: any[];
}

export const BulkOpsTable: React.FC<BulkOpsTableProps> = ({ operations }) => {
  return (
    <div>
      {operations.map((op: any) => (
        <div key={op.id}>
          <Typography variant="body" as="div">{op.name}</Typography>
        </div>
      ))}
    </div>
  );
};
