import * as React from 'react';
import { Typography } from '@/design-system/components/atoms/Typography/Typography';

export interface QRScannerProps {
  onScan?: (data: string) => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({ onScan }) => {
  return (
    <div>
      <Typography variant="body" as="div">QR Scanner Component</Typography>
    </div>
  );
};
