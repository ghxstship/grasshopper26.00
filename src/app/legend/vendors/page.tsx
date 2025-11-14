import { Suspense } from 'react';
import { Spinner } from '@/design-system';
import { createClient } from '@/lib/supabase/server';
import styles from './page.module.css';

export const metadata = {
  title: 'Vendors | GVTEWAY',
  description: 'Manage vendors',
};

async function VendorsList() {
  const supabase = await createClient();
  
  const { data: vendors, error } = await supabase
    .from('vendors')
    .select(`
      *,
      category:vendor_categories(category_name)
    `)
    .order('vendor_name');

  if (error) {
    console.error('Error fetching vendors:', error);
    return (
      <div className={styles.empty}>
        <p className={styles.emptyText}>ERROR LOADING VENDORS</p>
        <p className={styles.emptyText}>{error.message}</p>
      </div>
    );
  }

  if (!vendors || vendors.length === 0) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyText}>NO VENDORS FOUND</p>
      </div>
    );
  }

  return (
    <div className={styles.table}>
      <div className={styles.tableHeader}>
        <div className={styles.tableCell}>VENDOR</div>
        <div className={styles.tableCell}>CATEGORY</div>
        <div className={styles.tableCell}>LOCATION</div>
        <div className={styles.tableCell}>RATING</div>
        <div className={styles.tableCell}>STATUS</div>
      </div>
      {vendors.map((vendor: any) => (
        <div key={vendor.id} className={styles.tableRow}>
          <div className={styles.tableCell}>
            <span className={styles.vendorName}>{vendor.vendor_name}</span>
          </div>
          <div className={styles.tableCell}>
            {vendor.category?.category_name || '-'}
          </div>
          <div className={styles.tableCell}>
            {vendor.city && vendor.state ? `${vendor.city}, ${vendor.state}` : '-'}
          </div>
          <div className={styles.tableCell}>
            {vendor.overall_rating ? `${vendor.overall_rating.toFixed(1)}/5.0` : '-'}
          </div>
          <div className={styles.tableCell}>
            <span className={`${styles.status} ${styles[vendor.vendor_status]}`}>
              {vendor.vendor_status.toUpperCase()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function VendorsPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>VENDORS</h1>
      </div>

      <Suspense fallback={<Spinner />}>
        <VendorsList />
      </Suspense>
    </div>
  );
}
