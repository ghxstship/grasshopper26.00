import { Suspense } from 'react';
import { getOrganizations } from '@/lib/actions/organizations';
import Link from 'next/link';
import { OrganizationCard } from '@/design-system/components/molecules/OrganizationCard';
import { LoadingSpinner } from '@/design-system/components/atoms/LoadingSpinner';
import styles from './page.module.css';

export const metadata = {
  title: 'Organizations | GVTEWAY',
  description: 'Manage your organizations',
};

async function OrganizationsList() {
  const organizations = await getOrganizations();

  if (!organizations || organizations.length === 0) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyText}>NO ORGANIZATIONS FOUND</p>
        <Link href="/portal/organizations/new" className={styles.button}>
          CREATE ORGANIZATION
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {organizations.map((org) => (
        <OrganizationCard
          key={org.id}
          organization={org}
          href={`/portal/organizations/${org.id}`}
        />
      ))}
    </div>
  );
}

export default function OrganizationsPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>ORGANIZATIONS</h1>
        <Link href="/portal/organizations/new" className={styles.button}>
          NEW ORGANIZATION
        </Link>
      </div>

      <Suspense fallback={<LoadingSpinner />}>
        <OrganizationsList />
      </Suspense>
    </div>
  );
}
