/**
 * BrandsTable - Brands management table organism
 * GHXSTSHIP Atomic Design System
 */

import { Text } from '../../atoms';
import { Card } from '../../atoms/Card';

export interface BrandsTableProps {
  brands?: any[];
}

export function BrandsTable({ brands = [] }: BrandsTableProps) {
  return (
    <Card padding={6}>
      <Text>Brands Table - {brands.length} brands</Text>
    </Card>
  );
}
