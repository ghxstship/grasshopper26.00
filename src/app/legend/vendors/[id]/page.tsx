import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Spinner } from '@/design-system';
import styles from './page.module.css';

export const metadata = {
  title: 'Vendor Details | GVTEWAY',
};

async function VendorDetails({ id }: { id: string }) {
  const supabase = await createClient();
  
  const { data: vendor, error } = await supabase
    .from('vendors')
    .select(`
      *,
      category:vendor_categories(category_name),
      contracts(*),
      deliverables:vendor_deliverables(*)
    `)
    .eq('id', id)
    .single();

  if (error || !vendor) {
    notFound();
  }

  return (
    <div className={styles.content}>
      <div className={styles.infoSection}>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.label}>CATEGORY</span>
            <span className={styles.value}>{vendor.category?.category_name || '-'}</span>
          </div>
          
          <div className={styles.infoItem}>
            <span className={styles.label}>STATUS</span>
            <span className={`${styles.value} ${styles[vendor.vendor_status]}`}>
              {vendor.vendor_status.toUpperCase()}
            </span>
          </div>

          <div className={styles.infoItem}>
            <span className={styles.label}>RATING</span>
            <span className={styles.value}>
              {vendor.overall_rating ? `${vendor.overall_rating.toFixed(1)}/5.0` : 'N/A'}
            </span>
          </div>

          <div className={styles.infoItem}>
            <span className={styles.label}>TOTAL PROJECTS</span>
            <span className={styles.value}>{vendor.total_projects || 0}</span>
          </div>
        </div>

        {vendor.primary_contact_name && (
          <div className={styles.contactSection}>
            <h3 className={styles.sectionTitle}>CONTACT INFORMATION</h3>
            <div className={styles.contactGrid}>
              <div className={styles.contactItem}>
                <span className={styles.label}>NAME</span>
                <span className={styles.value}>{vendor.primary_contact_name}</span>
              </div>
              {vendor.primary_email && (
                <div className={styles.contactItem}>
                  <span className={styles.label}>EMAIL</span>
                  <a href={`mailto:${vendor.primary_email}`} className={styles.link}>
                    {vendor.primary_email}
                  </a>
                </div>
              )}
              {vendor.primary_phone && (
                <div className={styles.contactItem}>
                  <span className={styles.label}>PHONE</span>
                  <a href={`tel:${vendor.primary_phone}`} className={styles.link}>
                    {vendor.primary_phone}
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {vendor.contracts && vendor.contracts.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>CONTRACTS ({vendor.contracts.length})</h3>
          <div className={styles.table}>
            <div className={styles.tableHeader}>
              <div className={styles.tableCell}>CONTRACT</div>
              <div className={styles.tableCell}>VALUE</div>
              <div className={styles.tableCell}>STATUS</div>
            </div>
            {vendor.contracts.map((contract: any) => (
              <div key={contract.id} className={styles.tableRow}>
                <div className={styles.tableCell}>{contract.contract_name}</div>
                <div className={styles.tableCell}>${contract.contract_value.toLocaleString()}</div>
                <div className={styles.tableCell}>
                  <span className={`${styles.status} ${styles[contract.contract_status]}`}>
                    {contract.contract_status.toUpperCase().replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {vendor.deliverables && vendor.deliverables.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>DELIVERABLES ({vendor.deliverables.length})</h3>
          <div className={styles.table}>
            <div className={styles.tableHeader}>
              <div className={styles.tableCell}>DELIVERABLE</div>
              <div className={styles.tableCell}>DUE DATE</div>
              <div className={styles.tableCell}>STATUS</div>
            </div>
            {vendor.deliverables.map((deliverable: any) => (
              <div key={deliverable.id} className={styles.tableRow}>
                <div className={styles.tableCell}>{deliverable.deliverable_name}</div>
                <div className={styles.tableCell}>
                  {new Date(deliverable.due_date).toLocaleDateString()}
                </div>
                <div className={styles.tableCell}>
                  <span className={`${styles.status} ${styles[deliverable.deliverable_status]}`}>
                    {deliverable.deliverable_status.toUpperCase().replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default async function VendorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  
  const { data: vendor } = await supabase
    .from('vendors')
    .select('vendor_name')
    .eq('id', id)
    .single();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>{vendor?.vendor_name || 'VENDOR'}</h1>
      </div>

      <Suspense fallback={<Spinner />}>
        <VendorDetails id={id} />
      </Suspense>
    </div>
  );
}
