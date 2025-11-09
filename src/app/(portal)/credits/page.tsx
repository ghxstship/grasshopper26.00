'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/components/atoms/card';
import { Button } from '@/design-system/components/atoms/button';
import { Loader2, Coins, TrendingUp, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { formatDistanceToNow, format, isPast, differenceInDays } from 'date-fns';

interface Credit {
  id: string;
  amount: number;
  source: string;
  expires_at: string | null;
  created_at: string;
  used: boolean;
  used_at: string | null;
}

interface CreditStats {
  total_credits: number;
  available_credits: number;
  expiring_soon: number;
  expired_credits: number;
}

export default function CreditsPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<CreditStats>({
    total_credits: 0,
    available_credits: 0,
    expiring_soon: 0,
    expired_credits: 0,
  });
  const [credits, setCredits] = useState<Credit[]>([]);
  const [filter, setFilter] = useState<'all' | 'available' | 'expiring' | 'expired' | 'used'>('available');

  useEffect(() => {
    loadCredits();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadCredits = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login?redirect=/credits');
        return;
      }

      // Get all user credits
      const { data, error } = await supabase
        .from('user_credits')
        .select('*')
        .eq('user_id', user.id)
        .order('expires_at', { ascending: true, nullsFirst: false });

      if (error) throw error;

      const creditList = data || [];
      const now = new Date();

      // Calculate stats
      const totalCredits = creditList.reduce((sum, c) => sum + c.amount, 0);
      
      const availableCredits = creditList
        .filter(c => !c.used && (!c.expires_at || new Date(c.expires_at) > now))
        .reduce((sum, c) => sum + c.amount, 0);
      
      const expiringSoon = creditList
        .filter(c => {
          if (c.used || !c.expires_at) return false;
          const expiryDate = new Date(c.expires_at);
          const daysUntilExpiry = differenceInDays(expiryDate, now);
          return daysUntilExpiry >= 0 && daysUntilExpiry <= 30;
        })
        .reduce((sum, c) => sum + c.amount, 0);
      
      const expiredCredits = creditList
        .filter(c => !c.used && c.expires_at && new Date(c.expires_at) <= now)
        .reduce((sum, c) => sum + c.amount, 0);

      setStats({
        total_credits: totalCredits,
        available_credits: availableCredits,
        expiring_soon: expiringSoon,
        expired_credits: expiredCredits,
      });

      setCredits(creditList);
    } catch (error) {
      console.error('Error loading credits:', error);
      toast.error('Failed to load credits');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredCredits = () => {
    const now = new Date();
    
    switch (filter) {
      case 'available':
        return credits.filter(c => !c.used && (!c.expires_at || new Date(c.expires_at) > now));
      case 'expiring':
        return credits.filter(c => {
          if (c.used || !c.expires_at) return false;
          const expiryDate = new Date(c.expires_at);
          const daysUntilExpiry = differenceInDays(expiryDate, now);
          return daysUntilExpiry >= 0 && daysUntilExpiry <= 30;
        });
      case 'expired':
        return credits.filter(c => !c.used && c.expires_at && new Date(c.expires_at) <= now);
      case 'used':
        return credits.filter(c => c.used);
      default:
        return credits;
    }
  };

  const getCreditStatus = (credit: Credit) => {
    if (credit.used) {
      return {
        label: 'Used',
        color: 'text-gray-400',
        bgColor: 'bg-gray-500/20',
        borderColor: 'border-gray-500/30',
      };
    }

    if (!credit.expires_at) {
      return {
        label: 'Available',
        color: 'text-green-400',
        bgColor: 'bg-green-500/20',
        borderColor: 'border-green-500/30',
      };
    }

    const expiryDate = new Date(credit.expires_at);
    const now = new Date();
    const daysUntilExpiry = differenceInDays(expiryDate, now);

    if (isPast(expiryDate)) {
      return {
        label: 'Expired',
        color: 'text-red-400',
        bgColor: 'bg-red-500/20',
        borderColor: 'border-red-500/30',
      };
    }

    if (daysUntilExpiry <= 7) {
      return {
        label: `Expires in ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''}`,
        color: 'text-red-400',
        bgColor: 'bg-red-500/20',
        borderColor: 'border-red-500/30',
      };
    }

    if (daysUntilExpiry <= 30) {
      return {
        label: `Expires in ${daysUntilExpiry} days`,
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-500/20',
        borderColor: 'border-yellow-500/30',
      };
    }

    return {
      label: 'Available',
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      borderColor: 'border-green-500/30',
    };
  };

  const getSourceLabel = (source: string) => {
    const labels: Record<string, string> = {
      membership: 'Membership Allocation',
      purchase: 'Purchase Bonus',
      referral: 'Referral Reward',
      promotion: 'Promotional Credit',
      admin: 'Admin Grant',
    };
    return labels[source] || source;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-purple-950 to-black">
        <Loader2 className="h-12 w-12 animate-spin text-purple-500" />
      </div>
    );
  }

  const filteredCredits = getFilteredCredits();

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Ticket Credits</h1>
          <p className="text-gray-400 text-lg">
            Manage your ticket credits and track expiration dates
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-black/40 backdrop-blur-lg border-purple-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Coins className="h-8 w-8 text-purple-400" />
              </div>
              <p className="text-3xl font-bold text-white mb-1">
                ${stats.available_credits.toFixed(2)}
              </p>
              <p className="text-sm text-gray-400">Available Credits</p>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-lg border-purple-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="h-8 w-8 text-green-400" />
              </div>
              <p className="text-3xl font-bold text-white mb-1">
                ${stats.total_credits.toFixed(2)}
              </p>
              <p className="text-sm text-gray-400">Total Earned</p>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-lg border-yellow-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Clock className="h-8 w-8 text-yellow-400" />
              </div>
              <p className="text-3xl font-bold text-white mb-1">
                ${stats.expiring_soon.toFixed(2)}
              </p>
              <p className="text-sm text-gray-400">Expiring Soon</p>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-lg border-red-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <AlertCircle className="h-8 w-8 text-red-400" />
              </div>
              <p className="text-3xl font-bold text-white mb-1">
                ${stats.expired_credits.toFixed(2)}
              </p>
              <p className="text-sm text-gray-400">Expired</p>
            </CardContent>
          </Card>
        </div>

        {/* Expiring Soon Alert */}
        {stats.expiring_soon > 0 && (
          <Card className="bg-yellow-500/10 border-yellow-500/30 mb-8">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-6 w-6 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-yellow-400 mb-1">
                    Credits Expiring Soon
                  </h3>
                  <p className="text-gray-300 mb-3">
                    You have ${stats.expiring_soon.toFixed(2)} in credits expiring within the next 30 days.
                    Use them before they expire!
                  </p>
                  <Button asChild className="bg-gradient-to-r from-yellow-600 to-orange-600">
                    <Link href="/events">Browse Events</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filter Tabs */}
        <Card className="bg-black/40 backdrop-blur-lg border-purple-500/20 mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => setFilter('available')}
                variant={filter === 'available' ? 'default' : 'outline'}
                size="sm"
                className={filter === 'available' ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'border-purple-500/30'}
              >
                Available
              </Button>
              <Button
                onClick={() => setFilter('expiring')}
                variant={filter === 'expiring' ? 'default' : 'outline'}
                size="sm"
                className={filter === 'expiring' ? 'bg-gradient-to-r from-yellow-600 to-orange-600' : 'border-purple-500/30'}
              >
                Expiring Soon
              </Button>
              <Button
                onClick={() => setFilter('expired')}
                variant={filter === 'expired' ? 'default' : 'outline'}
                size="sm"
                className={filter === 'expired' ? 'bg-gradient-to-r from-red-600 to-pink-600' : 'border-purple-500/30'}
              >
                Expired
              </Button>
              <Button
                onClick={() => setFilter('used')}
                variant={filter === 'used' ? 'default' : 'outline'}
                size="sm"
                className={filter === 'used' ? 'bg-gradient-to-r from-gray-600 to-gray-700' : 'border-purple-500/30'}
              >
                Used
              </Button>
              <Button
                onClick={() => setFilter('all')}
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                className={filter === 'all' ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'border-purple-500/30'}
              >
                All
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Credits List */}
        <Card className="bg-black/40 backdrop-blur-lg border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white">Credit History</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredCredits.length === 0 ? (
              <div className="text-center py-12">
                <Coins className="h-16 w-16 mx-auto text-gray-600 mb-4" />
                <p className="text-gray-400">No credits found</p>
                <p className="text-sm text-gray-500 mt-2">
                  {filter === 'available' && 'You have no available credits at the moment.'}
                  {filter === 'expiring' && 'No credits are expiring soon.'}
                  {filter === 'expired' && 'No expired credits.'}
                  {filter === 'used' && 'No credits have been used yet.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredCredits.map((credit) => {
                  const status = getCreditStatus(credit);
                  
                  return (
                    <div
                      key={credit.id}
                      className={`p-4 rounded-lg border ${status.bgColor} ${status.borderColor}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl font-bold text-white">
                              ${credit.amount.toFixed(2)}
                            </span>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${status.color}`}>
                              {status.label}
                            </span>
                          </div>
                          <p className="text-sm text-gray-400 mb-1">
                            {getSourceLabel(credit.source)}
                          </p>
                          <p className="text-xs text-gray-500">
                            Received {formatDistanceToNow(new Date(credit.created_at), { addSuffix: true })}
                          </p>
                          {credit.expires_at && (
                            <p className={`text-xs mt-1 ${isPast(new Date(credit.expires_at)) ? 'text-red-400' : 'text-gray-400'}`}>
                              {isPast(new Date(credit.expires_at)) ? 'Expired' : 'Expires'} on {format(new Date(credit.expires_at), 'PPP')}
                            </p>
                          )}
                          {credit.used && credit.used_at && (
                            <p className="text-xs text-gray-500 mt-1">
                              Used {formatDistanceToNow(new Date(credit.used_at), { addSuffix: true })}
                            </p>
                          )}
                        </div>
                        {credit.used ? (
                          <CheckCircle className="h-6 w-6 text-gray-400" />
                        ) : credit.expires_at && isPast(new Date(credit.expires_at)) ? (
                          <AlertCircle className="h-6 w-6 text-red-400" />
                        ) : (
                          <Coins className="h-6 w-6 text-purple-400" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card className="bg-black/40 backdrop-blur-lg border-purple-500/20 mt-8">
          <CardHeader>
            <CardTitle className="text-white">About Credits</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-400 space-y-2">
            <p>• Credits are automatically allocated to active members each month</p>
            <p>• Most credits expire 90 days after allocation</p>
            <p>• Credits from referrals and promotions may have different expiration dates</p>
            <p>• Use credits at checkout to reduce your ticket purchase amount</p>
            <p>• Expired credits cannot be recovered or extended</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
