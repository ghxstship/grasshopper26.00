import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { LoadingSpinner } from '@/design-system/components/atoms/LoadingSpinner';
import styles from './page.module.css';

export const metadata = {
  title: 'Equipment | GVTEWAY',
};

async function EquipmentList() {
  const supabase = await createClient();
  
  const { data: equipment, error } = await supabase
    .from('equipment')
    .select('*, category:equipment_categories(category_name)')
    .order('equipment_name');

  if (error) throw error;

  if (!equipment || equipment.length === 0) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyText}>NO EQUIPMENT FOUND</p>
      </div>
    );
  }

  const availableEquipment = equipment.filter((e: any) => e.is_available);
  const unavailableEquipment = equipment.filter((e: any) => !e.is_available);

  return (
    <div className={styles.content}>
      {availableEquipment.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>AVAILABLE ({availableEquipment.length})</h2>
          <div className={styles.table}>
            <div className={styles.tableHeader}>
              <div className={styles.tableCell}>EQUIPMENT</div>
              <div className={styles.tableCell}>CATEGORY</div>
              <div className={styles.tableCell}>MODEL</div>
              <div className={styles.tableCell}>CONDITION</div>
              <div className={styles.tableCell}>LOCATION</div>
            </div>
            {availableEquipment.map((item: any) => (
              <div key={item.id} className={styles.tableRow}>
                <div className={styles.tableCell}>{item.equipment_name}</div>
                <div className={styles.tableCell}>{item.category?.category_name || '-'}</div>
                <div className={styles.tableCell}>{item.model_number || '-'}</div>
                <div className={styles.tableCell}>
                  <span className={`${styles.status} ${styles[item.condition_status]}`}>
                    {item.condition_status?.toUpperCase().replace('_', ' ') || '-'}
                  </span>
                </div>
                <div className={styles.tableCell}>{item.current_location || '-'}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {unavailableEquipment.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>IN USE ({unavailableEquipment.length})</h2>
          <div className={styles.table}>
            <div className={styles.tableHeader}>
              <div className={styles.tableCell}>EQUIPMENT</div>
              <div className={styles.tableCell}>CATEGORY</div>
              <div className={styles.tableCell}>MODEL</div>
              <div className={styles.tableCell}>CONDITION</div>
              <div className={styles.tableCell}>LOCATION</div>
            </div>
            {unavailableEquipment.map((item: any) => (
              <div key={item.id} className={styles.tableRow}>
                <div className={styles.tableCell}>{item.equipment_name}</div>
                <div className={styles.tableCell}>{item.category?.category_name || '-'}</div>
                <div className={styles.tableCell}>{item.model_number || '-'}</div>
                <div className={styles.tableCell}>
                  <span className={`${styles.status} ${styles[item.condition_status]}`}>
                    {item.condition_status?.toUpperCase().replace('_', ' ') || '-'}
                  </span>
                </div>
                <div className={styles.tableCell}>{item.current_location || '-'}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function EquipmentPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>EQUIPMENT INVENTORY</h1>
      </div>

      <Suspense fallback={<LoadingSpinner />}>
        <EquipmentList />
      </Suspense>
    </div>
  );
}
