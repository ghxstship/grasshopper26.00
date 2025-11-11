import Link from 'next/link';
import type { Contract } from '@/types/super-expansion';
import styles from './ContractCard.module.css';

interface ContractCardProps {
  contract: Contract & { vendor?: { vendor_name: string } };
  href?: string;
}

export function ContractCard({ contract, href }: ContractCardProps) {
  const content = (
    <>
      <div className={styles.header}>
        <h3 className={styles.title}>{contract.contract_name}</h3>
        <span className={`${styles.status} ${styles[contract.contract_status]}`}>
          {contract.contract_status.toUpperCase().replace('_', ' ')}
        </span>
      </div>

      <div className={styles.info}>
        <div className={styles.infoItem}>
          <span className={styles.label}>CONTRACT #</span>
          <span className={styles.value}>{contract.contract_number}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.label}>VALUE</span>
          <span className={styles.value}>${contract.contract_value.toLocaleString()}</span>
        </div>
      </div>

      {contract.vendor && (
        <div className={styles.vendor}>
          <span className={styles.label}>VENDOR</span>
          <span className={styles.vendorName}>{contract.vendor.vendor_name}</span>
        </div>
      )}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={styles.card}>
        {content}
      </Link>
    );
  }

  return <div className={styles.card}>{content}</div>;
}
