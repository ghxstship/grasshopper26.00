/**
 * Member Membership Page
 * Membership management and upgrades
 */

'use client';

import { PortalLayout } from '@/design-system/components/templates/PortalLayout/PortalLayout';
import { PortalSidebar } from '@/design-system/components/organisms/PortalSidebar/PortalSidebar';
import { Typography } from '@/design-system/components/atoms/Typography/Typography';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/components/atoms/Card';
import { Button } from '@/design-system/components/atoms/Button/Button';
import { StatCard } from '@/design-system/components/molecules/StatCard/StatCard';
import { useMembershipTiers } from '@/hooks/useMembershipTiers';
import { Crown, Ticket, Gift, Calendar, Check } from 'lucide-react';
import styles from './membership.module.css';

export default function MemberMembershipPage() {
  const { tiers, currentMembership, loading, error } = useMembershipTiers();

  if (loading) {
    return (
      <PortalLayout
        sidebar={<PortalSidebar />}
        title="Membership"
        description="Manage your GVTEWAY membership"
      >
        <div className={styles.loading}>
          <Typography variant="body">Loading membership information...</Typography>
        </div>
      </PortalLayout>
    );
  }

  if (error) {
    return (
      <PortalLayout
        sidebar={<PortalSidebar />}
        title="Membership"
        description="Manage your GVTEWAY membership"
      >
        <div className={styles.error}>
          <Typography variant="body" className={styles.errorText}>{error}</Typography>
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout
      sidebar={<PortalSidebar />}
      title="Membership"
      description="Manage your GVTEWAY membership"
    >
      {currentMembership && (
        <div className={styles.currentMembership}>
          <Card>
            <CardHeader>
              <CardTitle>Current Membership</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={styles.membershipHeader}>
                <div className={styles.tierBadge}>
                  <Crown className={styles.tierIcon} />
                  <Typography variant="h2">{currentMembership.tier.display_name}</Typography>
                </div>
                <Typography variant="body" className={styles.status}>
                  Status: {currentMembership.status}
                </Typography>
              </div>

              <div className={styles.statsGrid}>
                <StatCard 
                  label="Ticket Credits" 
                  value={currentMembership.ticket_credits_remaining} 
                  icon={<Ticket />} 
                />
                <StatCard 
                  label="VIP Upgrades" 
                  value={currentMembership.vip_upgrades_remaining} 
                  icon={<Gift />} 
                />
                <StatCard 
                  label="Renewal Date" 
                  value={currentMembership.renewal_date ? new Date(currentMembership.renewal_date).toLocaleDateString() : 'N/A'} 
                  icon={<Calendar />} 
                />
              </div>

              {currentMembership.tier.benefits && (
                <div className={styles.benefits}>
                  <Typography variant="h3" className={styles.benefitsTitle}>Your Benefits</Typography>
                  <ul className={styles.benefitsList}>
                    {Object.entries(currentMembership.tier.benefits).map(([key, value]) => (
                      <li key={key} className={styles.benefitItem}>
                        <Check className={styles.checkIcon} />
                        <Typography variant="body">{String(value)}</Typography>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <div className={styles.tiersSection}>
        <Typography variant="h2" className={styles.sectionTitle}>
          {currentMembership ? 'Upgrade Your Membership' : 'Choose Your Membership'}
        </Typography>
        
        <div className={styles.tiersGrid}>
          {tiers.map((tier) => (
            <Card key={tier.id} className={styles.tierCard}>
              <CardHeader>
                <CardTitle>{tier.display_name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={styles.tierPrice}>
                  <Typography variant="h2">
                    ${(tier.annual_price / 100).toFixed(0)}
                  </Typography>
                  <Typography variant="body" className={styles.priceLabel}>/year</Typography>
                </div>

                {tier.monthly_price && (
                  <Typography variant="body" className={styles.monthlyPrice}>
                    or ${(tier.monthly_price / 100).toFixed(0)}/month
                  </Typography>
                )}

                {tier.benefits && (
                  <ul className={styles.tierBenefits}>
                    {Object.entries(tier.benefits).slice(0, 5).map(([key, value]) => (
                      <li key={key} className={styles.tierBenefit}>
                        <Check className={styles.checkIcon} />
                        <Typography variant="body">{String(value)}</Typography>
                      </li>
                    ))}
                  </ul>
                )}

                <Button
                  className={styles.tierButton}
                  disabled={currentMembership?.tier_id === tier.id}
                >
                  {currentMembership?.tier_id === tier.id ? 'Current Plan' : 'Select Plan'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </PortalLayout>
  );
}
