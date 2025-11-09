'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/components/atoms/card';
import { Button } from '@/design-system/components/atoms/button';
import { Input } from '@/design-system/components/atoms/input';
import { Loader2, Copy, Share2, Gift, Users, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

interface ReferralStats {
  total_referrals: number;
  successful_conversions: number;
  pending_referrals: number;
  total_rewards_earned: number;
  referral_code: string;
}

interface Referral {
  id: string;
  referred_email: string;
  status: string;
  created_at: string;
  converted_at: string | null;
  reward_amount: number;
}

export default function ReferralsPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [referralLink, setReferralLink] = useState('');

  useEffect(() => {
    loadReferralData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadReferralData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login?redirect=/referrals');
        return;
      }

      // Get or create referral code
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('referral_code')
        .eq('user_id', user.id)
        .single();

      let referralCode = profile?.referral_code;
      
      if (!referralCode) {
        // Generate new referral code
        referralCode = `REF${user.id.substring(0, 8).toUpperCase()}`;
        await supabase
          .from('user_profiles')
          .upsert({
            user_id: user.id,
            referral_code: referralCode,
          });
      }

      // Get referral stats
      const { data: referralData } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });

      const referralList = referralData || [];
      const successfulConversions = referralList.filter(r => r.status === 'converted').length;
      const pendingReferrals = referralList.filter(r => r.status === 'pending').length;
      const totalRewards = referralList
        .filter(r => r.status === 'converted')
        .reduce((sum, r) => sum + (r.reward_amount || 0), 0);

      setStats({
        total_referrals: referralList.length,
        successful_conversions: successfulConversions,
        pending_referrals: pendingReferrals,
        total_rewards_earned: totalRewards,
        referral_code: referralCode,
      });

      setReferrals(referralList);
      setReferralLink(`${window.location.origin}/signup?ref=${referralCode}`);
    } catch (error) {
      console.error('Error loading referral data:', error);
      toast.error('Failed to load referral data');
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      toast.success('Referral link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const shareReferralLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join GVTEWAY',
          text: 'Join me on GVTEWAY and get exclusive access to amazing events!',
          url: referralLink,
        });
      } catch (error) {
        // User cancelled share
      }
    } else {
      copyReferralLink();
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      converted: 'bg-green-500/20 text-green-400 border-green-500/30',
      expired: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${styles[status as keyof typeof styles] || styles.pending}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-purple-950 to-black">
        <Loader2 className="h-12 w-12 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Referral Program</h1>
          <p className="text-gray-400 text-lg">
            Share GVTEWAY with friends and earn rewards
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-black/40 backdrop-blur-lg border-purple-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Users className="h-8 w-8 text-purple-400" />
              </div>
              <p className="text-3xl font-bold text-white mb-1">
                {stats?.total_referrals || 0}
              </p>
              <p className="text-sm text-gray-400">Total Referrals</p>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-lg border-purple-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="h-8 w-8 text-green-400" />
              </div>
              <p className="text-3xl font-bold text-white mb-1">
                {stats?.successful_conversions || 0}
              </p>
              <p className="text-sm text-gray-400">Successful Conversions</p>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-lg border-purple-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Gift className="h-8 w-8 text-yellow-400" />
              </div>
              <p className="text-3xl font-bold text-white mb-1">
                {stats?.pending_referrals || 0}
              </p>
              <p className="text-sm text-gray-400">Pending</p>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-lg border-purple-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Gift className="h-8 w-8 text-pink-400" />
              </div>
              <p className="text-3xl font-bold text-white mb-1">
                ${(stats?.total_rewards_earned || 0).toFixed(2)}
              </p>
              <p className="text-sm text-gray-400">Rewards Earned</p>
            </CardContent>
          </Card>
        </div>

        {/* Referral Link Card */}
        <Card className="bg-black/40 backdrop-blur-lg border-purple-500/20 mb-8">
          <CardHeader>
            <CardTitle className="text-white">Your Referral Link</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="text"
                value={referralLink}
                readOnly
                className="bg-black/30 border-purple-500/30 text-white"
              />
              <Button
                onClick={copyReferralLink}
                variant="outline"
                className="border-purple-500/30"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                onClick={shareReferralLink}
                className="bg-gradient-to-r from-purple-600 to-pink-600"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
            <p className="text-sm text-gray-400">
              Share this link with friends. When they sign up and make their first purchase, you both earn rewards!
            </p>
          </CardContent>
        </Card>

        {/* Referral List */}
        <Card className="bg-black/40 backdrop-blur-lg border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white">Referral History</CardTitle>
          </CardHeader>
          <CardContent>
            {referrals.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 mx-auto text-gray-600 mb-4" />
                <p className="text-gray-400">No referrals yet</p>
                <p className="text-sm text-gray-500 mt-2">
                  Start sharing your referral link to earn rewards!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {referrals.map((referral) => (
                  <div
                    key={referral.id}
                    className="p-4 bg-black/20 rounded-lg border border-purple-500/10"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-white font-medium">{referral.referred_email}</p>
                        <p className="text-sm text-gray-400">
                          Referred on {new Date(referral.created_at).toLocaleDateString()}
                        </p>
                        {referral.converted_at && (
                          <p className="text-sm text-green-400">
                            Converted on {new Date(referral.converted_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        {referral.status === 'converted' && (
                          <span className="text-green-400 font-semibold">
                            +${referral.reward_amount.toFixed(2)}
                          </span>
                        )}
                        {getStatusBadge(referral.status)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
