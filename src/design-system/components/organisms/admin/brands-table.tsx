import * as React from 'react';
import { Typography } from '@/design-system/components/atoms/Typography/Typography';

export interface BrandsTableProps {
  brands: any[];
}

export const BrandsTable: React.FC<BrandsTableProps> = ({ brands }) => {
  return (
    <div>
      {brands.map((brand: any) => (
        <div key={brand.id}>
          <Typography variant="body" as="div">{brand.name}</Typography>
        </div>
      ))}
    </div>
  );
};
