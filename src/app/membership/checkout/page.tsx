'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, Loader2, CreditCard } from 'lucide-react';
import { Button } from '@/design-system/components/atoms/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/components/atoms/card';
import styles from './page.module.css';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tier, setTier] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'annual' | 'monthly'>('annual');
  const [promoCode, setPromoCode] = useState('');

  useEffect(() => {
    const tierId = searchParams.get('tier');
    const billing = searchParams.get('billing') as 'annual' | 'monthly';
    
    if (billing) {
      setBillingCycle(billing);
    }

    if (!tierId) {
      router.push('/membership');
      return;
    }

    async function fetchTier() {
      try {
        const response = await fetch('/api/memberships/tiers');
        const data = await response.json();
        const selectedTier = data.tiers?.find((t: any) => t.id === tierId);
        
        if (!selectedTier) {
          router.push('/membership');
          return;
        }
        
        setTier(selectedTier);
      } catch (error) {
        console.error('Failed to fetch tier:', error);
        router.push('/membership');
      } finally {
        setLoading(false);
      }
    }

    fetchTier();
  }, [searchParams, router]);

  const handleCheckout = async () => {
    setProcessing(true);
    
    try {
      // Get current user
      const userResponse = await fetch('/api/auth/user');
      const userData = await userResponse.json();
      
      if (!userData.user) {
        router.push(`/login?redirect=/membership/checkout?tier=${tier.id}&billing=${billingCycle}`);
        return;
      }

      // Create subscription checkout session
      const response = await fetch('/api/memberships/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userData.user.id,
          tierId: tier.id,
          billingCycle,
          promoCode: promoCode || undefined,
          successUrl: `${window.location.origin}/portal?success=true`,
          cancelUrl: `${window.location.origin}/membership`,
        }),
      });

      const data = await response.json();

      if (data.error) {
        alert(data.error);
        setProcessing(false);
        return;
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to start checkout. Please try again.');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.row}>
        <div className={styles.textCenter}>
          <Loader2 className={styles.loadingIcon} />
          <p className={styles.loadingText}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!tier) {
    return null;
  }

  const price = billingCycle === 'annual' ? tier.price_annual : tier.price_monthly;
  const savings = billingCycle === 'annual' ? (tier.price_monthly * 12 - tier.price_annual) : 0;

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.headerTitle}>
            Complete Your Membership
          </h1>
          <p className={styles.headerSubtitle}>
            You&apos;re one step away from exclusive benefits
          </p>
        </div>

        <div className={styles.grid}>
          {/* Order Summary */}
          <div>
            <Card className={styles.cardBorder}>
              <CardHeader className={styles.cardHeaderBorder}>
                <CardTitle className={styles.cardTitle}>
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className={styles.card}>
                <div className={styles.section}>
                  <h3 className={styles.tierTitle}>
                    {tier.name}
                  </h3>
                  <p className={styles.tierDescription}>{tier.description}</p>
                </div>

                {/* Billing Cycle Toggle */}
                <div className={styles.section}>
                  <p className={styles.sectionLabel}>
                    Billing Cycle
                  </p>
                  <div className={styles.billingToggle}>
                    <button
                      onClick={() => setBillingCycle('monthly')}
                      className={`${styles.billingButton} ${
                        billingCycle === 'monthly'
                          ? styles.billingButtonActive
                          : styles.billingButtonInactive
                      }`}
                    >
                      Monthly
                    </button>
                    <button
                      onClick={() => setBillingCycle('annual')}
                      className={`${styles.billingButton} ${
                        billingCycle === 'annual'
                          ? styles.billingButtonActive
                          : styles.billingButtonInactive
                      }`}
                    >
                      Annual
                      {savings > 0 && (
                        <span className={styles.savingsBadge}>
                          Save ${savings}
                        </span>
                      )}
                    </button>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className={styles.priceBreakdown}>
                  <div className={styles.priceRow}>
                    <span className={styles.priceLabel}>
                      {tier.name} ({billingCycle})
                    </span>
                    <span className={styles.priceValue}>
                      ${price.toFixed(2)}
                    </span>
                  </div>
                  {billingCycle === 'annual' && savings > 0 && (
                    <div className={styles.priceRow}>
                      <span className={styles.priceLabel}>Annual savings</span>
                      <span className={styles.priceValue}>
                        -${savings.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Promo Code */}
                <div className={styles.section}>
                  <label htmlFor="promoCode" className={styles.sectionLabel}>
                    Promo Code (Optional)
                  </label>
                  <input
                    id="promoCode"
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    placeholder="ENTER CODE"
                    className={styles.promoInput}
                  />
                </div>

                {/* Total */}
                <div className={styles.totalSection}>
                  <div className={styles.totalRow}>
                    <span className={styles.totalLabel}>
                      Total {billingCycle === 'annual' ? 'Annual' : 'Monthly'}
                    </span>
                    <span className={styles.totalValue}>
                      ${price.toFixed(2)}
                    </span>
                  </div>
                  {billingCycle === 'monthly' && (
                    <p className={styles.billingNote}>
                      Billed monthly. Cancel anytime.
                    </p>
                  )}
                  {billingCycle === 'annual' && (
                    <p className={styles.billingNote}>
                      Billed annually. Save ${savings.toFixed(2)} vs monthly.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Benefits & Checkout */}
          <div>
            <Card className={`${styles.cardBorder} ${styles.mb6}`}>
              <CardHeader className={styles.cardHeaderBorder}>
                <CardTitle className={styles.cardTitle}>
                  What&apos;s Included
                </CardTitle>
              </CardHeader>
              <CardContent className={styles.card}>
                <ul className={styles.benefitsList}>
                  {tier.ticket_credits_monthly > 0 && (
                    <li className={styles.benefitItem}>
                      <Check className={styles.benefitIcon} />
                      <span className={styles.benefitText}>
                        <strong>{tier.ticket_credits_monthly}</strong> ticket credits per month
                      </span>
                    </li>
                  )}
                  {tier.priority_access && (
                    <li className={styles.benefitItem}>
                      <Check className={styles.benefitIcon} />
                      <span className={styles.benefitText}>
                        Priority access to ticket sales
                      </span>
                    </li>
                  )}
                  {tier.exclusive_events && (
                    <li className={styles.benefitItem}>
                      <Check className={styles.benefitIcon} />
                      <span className={styles.benefitText}>
                        Access to exclusive member events
                      </span>
                    </li>
                  )}
                  {tier.vip_vouchers_annual > 0 && (
                    <li className={styles.benefitItem}>
                      <Check className={styles.benefitIcon} />
                      <span className={styles.benefitText}>
                        <strong>{tier.vip_vouchers_annual}</strong> VIP upgrade vouchers per year
                      </span>
                    </li>
                  )}
                  {tier.discount_percentage > 0 && (
                    <li className={styles.benefitItem}>
                      <Check className={styles.benefitIcon} />
                      <span className={styles.benefitText}>
                        <strong>{tier.discount_percentage}%</strong> discount on all purchases
                      </span>
                    </li>
                  )}
                  <li className={styles.benefitItem}>
                    <Check className={styles.benefitIcon} />
                    <span className={styles.benefitText}>
                      Cancel anytime, no commitments
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Checkout Button */}
            <Button
              onClick={handleCheckout}
              disabled={processing}
              className={styles.checkoutButton}
            >
              {processing ? (
                <>
                  <Loader2 className={styles.iconSmall} />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className={styles.icon} />
                  Proceed to Payment
                </>
              )}
            </Button>

            <p className={styles.securityNote}>
              Secure payment powered by Stripe. Your payment information is encrypted and secure.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MembershipCheckoutPage() {
  return (
    <Suspense fallback={
      <div className={styles.row}>
        <Loader2 className={styles.loadingIcon} />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
