'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, Loader2, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-black mx-auto mb-4" />
          <p className="font-share-tech-mono text-sm uppercase tracking-wider">Loading...</p>
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
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-bebas-neue text-5xl uppercase tracking-wide mb-4">
            Complete Your Membership
          </h1>
          <p className="font-share-tech text-lg text-grey-700">
            You&apos;re one step away from exclusive benefits
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div>
            <Card className="border-3 border-black">
              <CardHeader className="border-b-2 border-black">
                <CardTitle className="font-bebas-neue text-2xl uppercase tracking-wide">
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="mb-6">
                  <h3 className="font-bebas-neue text-3xl uppercase tracking-wide mb-2">
                    {tier.name}
                  </h3>
                  <p className="font-share-tech text-grey-700">{tier.description}</p>
                </div>

                {/* Billing Cycle Toggle */}
                <div className="mb-6">
                  <p className="font-share-tech-mono text-sm uppercase tracking-wider text-grey-600 block mb-3">
                    Billing Cycle
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setBillingCycle('monthly')}
                      className={`flex-1 border-2 border-black px-4 py-3 font-share-tech-mono text-sm uppercase tracking-wider transition-colors ${
                        billingCycle === 'monthly'
                          ? 'bg-black text-white'
                          : 'bg-white text-black hover:bg-grey-100'
                      }`}
                    >
                      Monthly
                    </button>
                    <button
                      onClick={() => setBillingCycle('annual')}
                      className={`flex-1 border-2 border-black px-4 py-3 font-share-tech-mono text-sm uppercase tracking-wider transition-colors relative ${
                        billingCycle === 'annual'
                          ? 'bg-black text-white'
                          : 'bg-white text-black hover:bg-grey-100'
                      }`}
                    >
                      Annual
                      {savings > 0 && (
                        <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 font-share-tech-mono">
                          Save ${savings}
                        </span>
                      )}
                    </button>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="border-t-2 border-black pt-6 mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-share-tech text-grey-700">
                      {tier.name} ({billingCycle})
                    </span>
                    <span className="font-share-tech-mono font-bold">
                      ${price.toFixed(2)}
                    </span>
                  </div>
                  {billingCycle === 'annual' && savings > 0 && (
                    <div className="flex justify-between items-center mb-3 text-green-600">
                      <span className="font-share-tech text-sm">Annual savings</span>
                      <span className="font-share-tech-mono text-sm font-bold">
                        -${savings.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Promo Code */}
                <div className="mb-6">
                  <label htmlFor="promoCode" className="font-share-tech-mono text-sm uppercase tracking-wider text-grey-600 block mb-2">
                    Promo Code (Optional)
                  </label>
                  <input
                    id="promoCode"
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    placeholder="ENTER CODE"
                    className="w-full border-2 border-black px-4 py-3 font-share-tech-mono text-sm uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                {/* Total */}
                <div className="border-t-2 border-black pt-6">
                  <div className="flex justify-between items-center">
                    <span className="font-bebas-neue text-2xl uppercase tracking-wide">
                      Total {billingCycle === 'annual' ? 'Annual' : 'Monthly'}
                    </span>
                    <span className="font-bebas-neue text-3xl">
                      ${price.toFixed(2)}
                    </span>
                  </div>
                  {billingCycle === 'monthly' && (
                    <p className="font-share-tech text-xs text-grey-600 mt-2">
                      Billed monthly. Cancel anytime.
                    </p>
                  )}
                  {billingCycle === 'annual' && (
                    <p className="font-share-tech text-xs text-grey-600 mt-2">
                      Billed annually. Save ${savings.toFixed(2)} vs monthly.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Benefits & Checkout */}
          <div>
            <Card className="border-3 border-black mb-6">
              <CardHeader className="border-b-2 border-black">
                <CardTitle className="font-bebas-neue text-2xl uppercase tracking-wide">
                  What&apos;s Included
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ul className="space-y-3">
                  {tier.ticket_credits_monthly > 0 && (
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="font-share-tech text-grey-800">
                        <strong>{tier.ticket_credits_monthly}</strong> ticket credits per month
                      </span>
                    </li>
                  )}
                  {tier.priority_access && (
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="font-share-tech text-grey-800">
                        Priority access to ticket sales
                      </span>
                    </li>
                  )}
                  {tier.exclusive_events && (
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="font-share-tech text-grey-800">
                        Access to exclusive member events
                      </span>
                    </li>
                  )}
                  {tier.vip_vouchers_annual > 0 && (
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="font-share-tech text-grey-800">
                        <strong>{tier.vip_vouchers_annual}</strong> VIP upgrade vouchers per year
                      </span>
                    </li>
                  )}
                  {tier.discount_percentage > 0 && (
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="font-share-tech text-grey-800">
                        <strong>{tier.discount_percentage}%</strong> discount on all purchases
                      </span>
                    </li>
                  )}
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="font-share-tech text-grey-800">
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
              className="w-full bg-black text-white hover:bg-grey-900 py-6 font-bebas-neue text-xl uppercase tracking-wide border-3 border-black"
            >
              {processing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="h-5 w-5 mr-2" />
                  Proceed to Payment
                </>
              )}
            </Button>

            <p className="font-share-tech text-xs text-center text-grey-600 mt-4">
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
