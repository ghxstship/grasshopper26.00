import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { LoadingSpinner } from '@/design-system/components/atoms/LoadingSpinner';
import styles from './page.module.css';

export const metadata = {
  title: 'Marketing Campaigns | GVTEWAY',
};

async function CampaignsList() {
  const supabase = await createClient();
  
  const { data: campaigns, error } = await supabase
    .from('marketing_campaigns')
    .select('*, event:events(event_name)')
    .order('start_date', { ascending: false });

  if (error) throw error;

  if (!campaigns || campaigns.length === 0) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyText}>NO CAMPAIGNS FOUND</p>
      </div>
    );
  }

  const activeCampaigns = campaigns.filter(c => 
    ['planning', 'scheduled', 'active'].includes(c.campaign_status)
  );
  
  const completedCampaigns = campaigns.filter(c => 
    ['completed', 'cancelled'].includes(c.campaign_status)
  );

  return (
    <div className={styles.content}>
      {activeCampaigns.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>ACTIVE ({activeCampaigns.length})</h2>
          <div className={styles.table}>
            <div className={styles.tableHeader}>
              <div className={styles.tableCell}>CAMPAIGN</div>
              <div className={styles.tableCell}>EVENT</div>
              <div className={styles.tableCell}>TYPE</div>
              <div className={styles.tableCell}>BUDGET</div>
              <div className={styles.tableCell}>REACH</div>
              <div className={styles.tableCell}>STATUS</div>
            </div>
            {activeCampaigns.map((campaign: any) => (
              <div key={campaign.id} className={styles.tableRow}>
                <div className={styles.tableCell}>{campaign.campaign_name}</div>
                <div className={styles.tableCell}>{campaign.event?.event_name || '-'}</div>
                <div className={styles.tableCell}>
                  {campaign.campaign_type?.toUpperCase().replace('_', ' ') || '-'}
                </div>
                <div className={styles.tableCell}>
                  ${campaign.budgeted_amount?.toLocaleString() || '0'}
                </div>
                <div className={styles.tableCell}>
                  {campaign.actual_reach.toLocaleString()}
                  {campaign.target_reach && ` / ${campaign.target_reach.toLocaleString()}`}
                </div>
                <div className={styles.tableCell}>
                  <span className={`${styles.status} ${styles[campaign.campaign_status]}`}>
                    {campaign.campaign_status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {completedCampaigns.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>COMPLETED ({completedCampaigns.length})</h2>
          <div className={styles.table}>
            <div className={styles.tableHeader}>
              <div className={styles.tableCell}>CAMPAIGN</div>
              <div className={styles.tableCell}>EVENT</div>
              <div className={styles.tableCell}>TYPE</div>
              <div className={styles.tableCell}>SPEND</div>
              <div className={styles.tableCell}>REACH</div>
              <div className={styles.tableCell}>STATUS</div>
            </div>
            {completedCampaigns.map((campaign: any) => (
              <div key={campaign.id} className={styles.tableRow}>
                <div className={styles.tableCell}>{campaign.campaign_name}</div>
                <div className={styles.tableCell}>{campaign.event?.event_name || '-'}</div>
                <div className={styles.tableCell}>
                  {campaign.campaign_type?.toUpperCase().replace('_', ' ') || '-'}
                </div>
                <div className={styles.tableCell}>
                  ${campaign.actual_spend.toLocaleString()}
                </div>
                <div className={styles.tableCell}>
                  {campaign.actual_reach.toLocaleString()}
                </div>
                <div className={styles.tableCell}>
                  <span className={`${styles.status} ${styles[campaign.campaign_status]}`}>
                    {campaign.campaign_status.toUpperCase()}
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

export default function CampaignsPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>MARKETING CAMPAIGNS</h1>
      </div>

      <Suspense fallback={<LoadingSpinner />}>
        <CampaignsList />
      </Suspense>
    </div>
  );
}
