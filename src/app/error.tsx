'use client';

import { ErrorLayout } from '@/design-system/components/templates/ErrorLayout/ErrorLayout';
import { Button } from '@/design-system/components/atoms/Button/Button';
import { Typography } from '@/design-system/components/atoms/Typography/Typography';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorLayout
      code="500"
      title="Something Went Wrong"
      message="An unexpected error occurred. Please try again."
      logo={
        <Typography variant="h2" as="div">
          GVTEWAY
        </Typography>
      }
      actions={
        <>
          <Button variant="filled" onClick={reset}>
            Try Again
          </Button>
          <Button variant="outlined" onClick={() => window.location.href = '/'}>
            Go Home
          </Button>
        </>
      }
      showPattern
    />
  );
}
