'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TierComparison } from '@/components/membership/tier-comparison';
import { Check } from 'lucide-react';

export default function MembershipPage() {
  const router = useRouter();
  const [tiers, setTiers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTiers() {
      try {
        const response = await fetch('/api/memberships/tiers');
        const data = await response.json();
        setTiers(data.tiers || []);
      } catch (error) {
        console.error('Failed to fetch tiers:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchTiers();
  }, []);

  const handleSelectTier = (tier: any, billingCycle: 'annual' | 'monthly') => {
    router.push(`/membership/checkout?tier=${tier.id}&billing=${billingCycle}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="font-share-tech-mono text-sm uppercase tracking-wider">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="border-b-3 border-black bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="font-bebas-neue text-6xl md:text-7xl uppercase tracking-wide mb-4">
            GVTEWAY Membership
          </h1>
          <p className="font-share-tech text-xl text-grey-700 max-w-3xl mx-auto mb-8">
            Unlock exclusive benefits, ticket credits, early access, and VIP experiences.
            Choose the tier that fits your lifestyle.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-600" />
              <span className="font-share-tech-mono text-sm uppercase tracking-wider">
                Monthly Ticket Credits
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-600" />
              <span className="font-share-tech-mono text-sm uppercase tracking-wider">
                Priority Access
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-600" />
              <span className="font-share-tech-mono text-sm uppercase tracking-wider">
                Exclusive Events
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-600" />
              <span className="font-share-tech-mono text-sm uppercase tracking-wider">
                VIP Upgrades
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tier Comparison */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <TierComparison tiers={tiers || []} onSelectTier={handleSelectTier} />
      </div>

      {/* Benefits Section */}
      <div className="border-t-3 border-black bg-grey-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="font-bebas-neue text-4xl uppercase tracking-wide text-center mb-12">
            Membership Benefits
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="border-3 border-black bg-white p-8">
              <div className="w-12 h-12 bg-black text-white flex items-center justify-center mb-4 font-bebas-neue text-2xl">
                01
              </div>
              <h3 className="font-bebas-neue text-2xl uppercase tracking-wide mb-3">
                Ticket Credits
              </h3>
              <p className="font-share-tech text-grey-700">
                Receive monthly ticket credits to use on any event. Credits roll over and never expire
                as long as your membership is active.
              </p>
            </div>
            <div className="border-3 border-black bg-white p-8">
              <div className="w-12 h-12 bg-black text-white flex items-center justify-center mb-4 font-bebas-neue text-2xl">
                02
              </div>
              <h3 className="font-bebas-neue text-2xl uppercase tracking-wide mb-3">
                Priority Access
              </h3>
              <p className="font-share-tech text-grey-700">
                Get early access to ticket sales before the general public. Never miss out on
                sold-out shows again.
              </p>
            </div>
            <div className="border-3 border-black bg-white p-8">
              <div className="w-12 h-12 bg-black text-white flex items-center justify-center mb-4 font-bebas-neue text-2xl">
                03
              </div>
              <h3 className="font-bebas-neue text-2xl uppercase tracking-wide mb-3">
                Exclusive Events
              </h3>
              <p className="font-share-tech text-grey-700">
                Access members-only events, meet & greets, and special experiences not available
                to the general public.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="font-bebas-neue text-4xl uppercase tracking-wide text-center mb-12">
          Frequently Asked Questions
        </h2>
        <div className="space-y-6">
          <div className="border-2 border-black p-6">
            <h3 className="font-bebas-neue text-xl uppercase tracking-wide mb-2">
              Can I cancel anytime?
            </h3>
            <p className="font-share-tech text-grey-700">
              Yes! You can cancel your membership at any time. Your benefits will remain active
              until the end of your current billing period.
            </p>
          </div>
          <div className="border-2 border-black p-6">
            <h3 className="font-bebas-neue text-xl uppercase tracking-wide mb-2">
              Do ticket credits expire?
            </h3>
            <p className="font-share-tech text-grey-700">
              Credits roll over month-to-month and never expire as long as your membership is active.
              If you cancel, you&apos;ll have 30 days to use remaining credits.
            </p>
          </div>
          <div className="border-2 border-black p-6">
            <h3 className="font-bebas-neue text-xl uppercase tracking-wide mb-2">
              Can I upgrade my tier?
            </h3>
            <p className="font-share-tech text-grey-700">
              Absolutely! You can upgrade to a higher tier at any time. You&apos;ll be prorated for
              the difference and receive the new benefits immediately.
            </p>
          </div>
          <div className="border-2 border-black p-6">
            <h3 className="font-bebas-neue text-xl uppercase tracking-wide mb-2">
              What payment methods do you accept?
            </h3>
            <p className="font-share-tech text-grey-700">
              We accept all major credit cards (Visa, Mastercard, American Express, Discover)
              through our secure payment processor Stripe.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="border-t-3 border-black bg-black text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="font-bebas-neue text-5xl uppercase tracking-wide mb-4">
            Ready to Join?
          </h2>
          <p className="font-share-tech text-xl text-grey-300 mb-8">
            Choose your tier above and start enjoying exclusive benefits today.
          </p>
          <p className="font-share-tech-mono text-sm uppercase tracking-wider text-grey-400">
            Questions? Contact us at support@gvteway.com
          </p>
        </div>
      </div>
    </div>
  );
}
