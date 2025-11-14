import { Text } from '../../atoms';
import { Card } from '../../atoms/Card';

export function OrdersTable({ orders = [] }: { orders?: any[] }) {
  return (
    <Card padding={6}>
      <Text>Orders Table - {orders.length} orders</Text>
    </Card>
  );
}
