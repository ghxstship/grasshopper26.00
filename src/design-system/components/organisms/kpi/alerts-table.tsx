/**
 * KPI Alerts Table
 * GHXSTSHIP Design System
 */

import * as React from 'react';
import { Typography } from '@/design-system/components/atoms/Typography/Typography';

export interface Alert {
  id: string;
  name: string;
  status: string;
  [key: string]: any;
}

export interface AlertsTableProps {
  alerts: Alert[];
}

export const AlertsTable: React.FC<AlertsTableProps> = ({ alerts }) => {
  return (
    <div>
      {alerts.map((alert) => (
        <div key={alert.id}>
          <Typography variant="body" as="div">{alert.name}</Typography>
        </div>
      ))}
    </div>
  );
};
