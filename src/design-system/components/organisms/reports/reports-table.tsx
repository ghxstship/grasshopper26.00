import * as React from 'react';
import { Typography } from '@/design-system/components/atoms/Typography/Typography';

export interface ReportsTableProps {
  reports: any[];
}

export const ReportsTable: React.FC<ReportsTableProps> = ({ reports }) => {
  return (
    <div>
      {reports.map((report: any) => (
        <div key={report.id}>
          <Typography variant="body" as="div">{report.name}</Typography>
        </div>
      ))}
    </div>
  );
};
