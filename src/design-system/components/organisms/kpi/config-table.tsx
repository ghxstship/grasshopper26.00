/**
 * KPI Config Table
 * GHXSTSHIP Design System
 */

import * as React from 'react';
import { Typography } from '@/design-system/components/atoms/Typography/Typography';

export interface Config {
  id: string;
  name: string;
  value: string;
  [key: string]: any;
}

export interface ConfigTableProps {
  configs: Config[];
}

export const ConfigTable: React.FC<ConfigTableProps> = ({ configs }) => {
  return (
    <div>
      {configs.map((config) => (
        <div key={config.id}>
          <Typography variant="body" as="div">{config.name}</Typography>
        </div>
      ))}
    </div>
  );
};
