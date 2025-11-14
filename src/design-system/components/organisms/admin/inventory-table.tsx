import { Text } from '../../atoms';
import { Card } from '../../atoms/Card';

export function InventoryTable({ items = [] }: { items?: any[] }) {
  return (
    <Card padding={6}>
      <Text>Inventory Table - {items.length} items</Text>
    </Card>
  );
}
