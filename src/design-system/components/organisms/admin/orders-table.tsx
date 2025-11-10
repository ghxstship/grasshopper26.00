import * as React from 'react';
import { Typography } from '@/design-system/components/atoms/Typography/Typography';

export interface OrdersTableProps {
  orders: any[];
}

export const OrdersTable: React.FC<OrdersTableProps> = ({ orders }) => {
  return (
    <div>
      {orders.map((item: any) => (
        <div key={item.id}>
          <Typography variant="body" as="div">{item.name || item.title || item.id}</Typography>
        </div>
      ))}
    </div>
  );
};
