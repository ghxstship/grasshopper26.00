import { Text } from '../../atoms';
import { Card } from '../../atoms/Card';

export function RolesTable({ roles = [] }: { roles?: any[] }) {
  return (
    <Card padding={6}>
      <Text>Roles Table - {roles.length} roles</Text>
    </Card>
  );
}
