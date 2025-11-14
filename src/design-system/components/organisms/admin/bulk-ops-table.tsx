import { Text } from '../../atoms';
import { Card } from '../../atoms/Card';

export function BulkOpsTable({ operations = [] }: { operations?: any[] }) {
  return (
    <Card padding={6}>
      <Text>Bulk Operations Table - {operations.length} operations</Text>
    </Card>
  );
}
