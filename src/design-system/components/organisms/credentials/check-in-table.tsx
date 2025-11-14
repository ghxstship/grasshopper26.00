import { Text } from '../../atoms';
import { Card } from '../../atoms/Card';

export function CheckInTable({ checkIns = [] }: { checkIns?: any[] }) {
  return (
    <Card padding={6}>
      <Text>Check-In Table - {checkIns.length} check-ins</Text>
    </Card>
  );
}
