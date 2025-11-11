import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { LoadingSpinner } from '@/design-system/components/atoms/LoadingSpinner';
import styles from './page.module.css';

async function EventVendors({ eventId }: { eventId: string }) {
  const supabase = await createClient();
  
  const { data: contracts, error } = await supabase
    .from('contracts')
    .select(`
      *,
      vendor:vendors(
        id,
        vendor_name,
        vendor_status,
        overall_rating,
        category:vendor_categories(category_name)
      )
    `)
    .eq('event_id', eventId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  if (!contracts || contracts.length === 0) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyText}>NO VENDORS ASSIGNED</p>
      </div>
    );
  }

  return (
    <div className={styles.table}>
      <div className={styles.tableHeader}>
        <div className={styles.tableCell}>VENDOR</div>
        <div className={styles.tableCell}>CATEGORY</div>
        <div className={styles.tableCell}>CONTRACT VALUE</div>
        <div className={styles.tableCell}>STATUS</div>
        <div className={styles.tableCell}>RATING</div>
      </div>
      {contracts.map((contract: any) => (
        <Link
          key={contract.id}
          href={`/portal/vendors/${contract.vendor?.id}`}
          className={styles.tableRow}
        >
          <div className={styles.tableCell}>
            <span className={styles.vendorName}>{contract.vendor?.vendor_name || 'Unknown'}</span>
          </div>
          <div className={styles.tableCell}>
            {contract.vendor?.category?.category_name || '-'}
          </div>
          <div className={styles.tableCell}>
            ${contract.contract_value.toLocaleString()}
          </div>
          <div className={styles.tableCell}>
            <span className={`${styles.status} ${styles[contract.contract_status]}`}>
              {contract.contract_status.toUpperCase().replace('_', ' ')}
            </span>
          </div>
          <div className={styles.tableCell}>
            {contract.vendor?.overall_rating ? `${contract.vendor.overall_rating.toFixed(1)}/5.0` : 'N/A'}
          </div>
        </Link>
      ))}
    </div>
  );
}

export default async function EventVendorsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  
  const { data: event } = await supabase
    .from('events')
    .select('event_name')
    .eq('id', id)
    .single();

  if (!event) notFound();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>EVENT VENDORS</h1>
      </div>

      <Suspense fallback={<LoadingSpinner />}>
        <EventVendors eventId={id} />
      </Suspense>
    </div>
  );
}
