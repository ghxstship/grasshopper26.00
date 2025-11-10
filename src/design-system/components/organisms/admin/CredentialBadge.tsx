import * as React from 'react';
import { Typography } from '@/design-system/components/atoms/Typography/Typography';

export interface CredentialBadgeProps {
  credential: any;
}

export const CredentialBadge: React.FC<CredentialBadgeProps> = ({ credential }) => {
  return (
    <div style={{ padding: 'var(--space-4)', border: '3px solid var(--color-border-default)' }}>
      <Typography variant="h3" as="div">{credential.credential_number}</Typography>
      <Typography variant="body" as="div">{credential.name}</Typography>
    </div>
  );
};
