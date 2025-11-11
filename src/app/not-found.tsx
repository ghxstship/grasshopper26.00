'use client';

import { ErrorLayout } from '@/design-system/components/templates/ErrorLayout/ErrorLayout';
import { Button } from '@/design-system/components/atoms/Button/Button';
import { Typography } from '@/design-system/components/atoms/Typography/Typography';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  return (
    <ErrorLayout
      code="404"
      title="Page Not Found"
      message="The page you're looking for doesn't exist or has been moved."
      logo={
        <Typography variant="h2" as="div">
          GVTEWAY
        </Typography>
      }
      actions={
        <>
          <Link href="/events">
            <Button variant="filled">
              Browse Events
            </Button>
          </Link>
          <Button variant="outlined" onClick={() => router.back()}>
            Go Back
          </Button>
          <Link href="/">
            <Button variant="outlined">
              Go Home
            </Button>
          </Link>
        </>
      }
      showPattern
    />
  );
}
