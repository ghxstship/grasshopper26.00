import { Text } from '../../atoms';
import { Card } from '../../atoms/Card';

export function QRScanner({ eventId, onScan }: { eventId?: string; onScan?: (data: string) => void }) {
  return (
    <Card padding={6}>
      <Text>QR Scanner {eventId && `for event ${eventId}`}</Text>
    </Card>
  );
}
