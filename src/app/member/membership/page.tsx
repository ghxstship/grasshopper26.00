/**
 * Member Membership Page
 * Membership management and upgrades
 */

'use client';

import { PortalLayout } from '@/design-system';
import { PortalSidebar } from '@/design-system';
import { Heading, Text, Card, CardHeader, CardTitle, CardContent, Button } from '@/design-system';
import { StatCard } from '@/design-system';
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
          <Text>Loading membership information...</Text>
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
          <Text className={styles.errorText}>{error}</Text>
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
                  <Heading level={2} font="bebas">{currentMembership.tier.display_name}</Heading>
                </div>
                <Text className={styles.status}>
                  Status: {currentMembership.status}
                </Text>
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
                  <Heading level={3} font="bebas" className={styles.benefitsTitle}>Your Benefits</Heading>
                  <ul className={styles.benefitsList}>
                    {Object.entries(currentMembership.tier.benefits).map(([key, value]) => (
                      <li key={key} className={styles.benefitItem}>
                        <Check className={styles.checkIcon} />
                        <Text>{String(value)}</Text>
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
        <Heading level={2} font="bebas" className={styles.sectionTitle}>
          {currentMembership ? 'Upgrade Your Membership' : 'Choose Your Membership'}
        </Heading>
        
        <div className={styles.tiersGrid}>
          {tiers.map((tier) => (
            <Card key={tier.id} className={styles.tierCard}>
              <CardHeader>
                <CardTitle>{tier.display_name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={styles.tierPrice}>
                  <Heading level={2} font="bebas">
                    ${(tier.annual_price / 100).toFixed(0)}
                  </Heading>
                  <Text className={styles.priceLabel}>/year</Text>
                </div>

                {tier.monthly_price && (
                  <Text className={styles.monthlyPrice}>
                    or ${(tier.monthly_price / 100).toFixed(0)}/month
                  </Text>
                )}

                {tier.benefits && (
                  <ul className={styles.tierBenefits}>
                    {Object.entries(tier.benefits).slice(0, 5).map(([key, value]) => (
                      <li key={key} className={styles.tierBenefit}>
                        <Check className={styles.checkIcon} />
                        <Text>{String(value)}</Text>
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
