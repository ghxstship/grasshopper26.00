import { ErrorLayout } from '@/design-system/components/templates/ErrorLayout/ErrorLayout';
import { Button } from '@/design-system/components/atoms/Button/Button';
import { Typography } from '@/design-system/components/atoms/Typography/Typography';
import Link from 'next/link';

export default function NotFound() {
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
          <Link href="/">
            <Button variant="filled">
              Go Home
            </Button>
          </Link>
          <Link href="/events">
            <Button variant="outlined">
              Browse Events
            </Button>
          </Link>
        </>
      }
      showPattern
    />
  );
}
