/**
 * ArtistsTable - Artists management table organism
 * GHXSTSHIP Atomic Design System
 */

import { Text } from '../../atoms';
import { Card } from '../../atoms/Card';

export interface ArtistsTableProps {
  artists?: any[];
}

export function ArtistsTable({ artists = [] }: ArtistsTableProps) {
  return (
    <Card padding={6}>
      <Text>Artists Table - {artists.length} artists</Text>
    </Card>
  );
}
