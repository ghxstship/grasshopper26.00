import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { ContractCard } from '@/design-system/components/molecules/ContractCard';
import { LoadingSpinner } from '@/design-system/components/atoms/LoadingSpinner';
import styles from './page.module.css';

export const metadata = {
  title: 'Contracts | GVTEWAY',
};

async function ContractsList() {
  const supabase = await createClient();
  
  const { data: contracts, error } = await supabase
    .from('contracts')
    .select('*, vendor:vendors(vendor_name), event:events(event_name)')
    .order('created_at', { ascending: false });

  if (error) throw error;

  if (!contracts || contracts.length === 0) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyText}>NO CONTRACTS FOUND</p>
      </div>
    );
  }

  const activeContracts = contracts.filter(c => 
    ['active', 'pending_signature'].includes(c.contract_status)
  );
  
  const draftContracts = contracts.filter(c => 
    ['draft', 'pending_review'].includes(c.contract_status)
  );

  return (
    <div className={styles.content}>
      {activeContracts.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>ACTIVE ({activeContracts.length})</h2>
          <div className={styles.grid}>
            {activeContracts.map((contract) => (
              <ContractCard
                key={contract.id}
                contract={contract}
                href={`/organization/contracts/${contract.id}`}
              />
            ))}
          </div>
        </div>
      )}

      {draftContracts.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>DRAFT ({draftContracts.length})</h2>
          <div className={styles.grid}>
            {draftContracts.map((contract) => (
              <ContractCard
                key={contract.id}
                contract={contract}
                href={`/organization/contracts/${contract.id}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ContractsPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>CONTRACTS</h1>
      </div>

      <Suspense fallback={<LoadingSpinner />}>
        <ContractsList />
      </Suspense>
    </div>
  );
}
