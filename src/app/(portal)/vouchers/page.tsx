'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/components/atoms/card';
import { Button } from '@/design-system/components/atoms/button';
import { Input } from '@/design-system/components/atoms/input';
import { Loader2, Ticket, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Voucher {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_purchase_amount: number | null;
  max_uses: number | null;
  uses_count: number;
  valid_from: string;
  valid_until: string;
  status: string;
  redeemed_at: string | null;
}

export default function VouchersPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(false);
  const [voucherCode, setVoucherCode] = useState('');
  const [myVouchers, setMyVouchers] = useState<Voucher[]>([]);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    message: string;
    voucher?: Voucher;
  } | null>(null);

  useEffect(() => {
    loadMyVouchers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadMyVouchers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login?redirect=/vouchers');
        return;
      }

      // Get user's redeemed vouchers
      const { data, error } = await supabase
        .from('user_vouchers')
        .select(`
          *,
          voucher:vouchers (
            id,
            code,
            discount_type,
            discount_value,
            min_purchase_amount,
            max_uses,
            uses_count,
            valid_from,
            valid_until,
            status
          )
        `)
        .eq('user_id', user.id)
        .order('redeemed_at', { ascending: false });

      if (error) throw error;

      const vouchers = (data || []).map((uv: any) => ({
        ...uv.voucher,
        redeemed_at: uv.redeemed_at,
      }));

      setMyVouchers(vouchers);
    } catch (error) {
      console.error('Error loading vouchers:', error);
      toast.error('Failed to load vouchers');
    } finally {
      setLoading(false);
    }
  };

  const validateVoucher = async () => {
    if (!voucherCode.trim()) {
      toast.error('Please enter a voucher code');
      return;
    }

    setRedeeming(true);
    setValidationResult(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login?redirect=/vouchers');
        return;
      }

      // Check if voucher exists and is valid
      const { data: voucher, error } = await supabase
        .from('vouchers')
        .select('*')
        .eq('code', voucherCode.toUpperCase())
        .single();

      if (error || !voucher) {
        setValidationResult({
          valid: false,
          message: 'Invalid voucher code',
        });
        return;
      }

      // Check if already redeemed by user
      const { data: existingRedemption } = await supabase
        .from('user_vouchers')
        .select('id')
        .eq('user_id', user.id)
        .eq('voucher_id', voucher.id)
        .single();

      if (existingRedemption) {
        setValidationResult({
          valid: false,
          message: 'You have already redeemed this voucher',
        });
        return;
      }

      // Check if voucher is active
      if (voucher.status !== 'active') {
        setValidationResult({
          valid: false,
          message: 'This voucher is no longer active',
        });
        return;
      }

      // Check validity dates
      const now = new Date();
      const validFrom = new Date(voucher.valid_from);
      const validUntil = new Date(voucher.valid_until);

      if (now < validFrom) {
        setValidationResult({
          valid: false,
          message: `This voucher is not valid until ${validFrom.toLocaleDateString()}`,
        });
        return;
      }

      if (now > validUntil) {
        setValidationResult({
          valid: false,
          message: 'This voucher has expired',
        });
        return;
      }

      // Check usage limit
      if (voucher.max_uses && voucher.uses_count >= voucher.max_uses) {
        setValidationResult({
          valid: false,
          message: 'This voucher has reached its usage limit',
        });
        return;
      }

      // Voucher is valid
      setValidationResult({
        valid: true,
        message: 'Voucher is valid and ready to use!',
        voucher,
      });
    } catch (error) {
      console.error('Error validating voucher:', error);
      toast.error('Failed to validate voucher');
    } finally {
      setRedeeming(false);
    }
  };

  const redeemVoucher = async () => {
    if (!validationResult?.valid || !validationResult.voucher) return;

    setRedeeming(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login?redirect=/vouchers');
        return;
      }

      // Redeem the voucher
      const { error } = await supabase
        .from('user_vouchers')
        .insert({
          user_id: user.id,
          voucher_id: validationResult.voucher.id,
          redeemed_at: new Date().toISOString(),
        });

      if (error) throw error;

      // Increment usage count
      await supabase
        .from('vouchers')
        .update({ uses_count: validationResult.voucher.uses_count + 1 })
        .eq('id', validationResult.voucher.id);

      toast.success('Voucher redeemed successfully! Use it at checkout.');
      setVoucherCode('');
      setValidationResult(null);
      loadMyVouchers();
    } catch (error) {
      console.error('Error redeeming voucher:', error);
      toast.error('Failed to redeem voucher');
    } finally {
      setRedeeming(false);
    }
  };

  const getDiscountText = (voucher: Voucher) => {
    if (voucher.discount_type === 'percentage') {
      return `${voucher.discount_value}% OFF`;
    } else {
      return `$${voucher.discount_value.toFixed(2)} OFF`;
    }
  };

  const isVoucherExpired = (voucher: Voucher) => {
    return new Date(voucher.valid_until) < new Date();
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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Vouchers</h1>
          <p className="text-gray-400 text-lg">
            Redeem voucher codes for exclusive discounts
          </p>
        </div>

        {/* Redeem Voucher Card */}
        <Card className="bg-black/40 backdrop-blur-lg border-purple-500/20 mb-8">
          <CardHeader>
            <CardTitle className="text-white">Redeem Voucher Code</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Enter voucher code"
                value={voucherCode}
                onChange={(e) => {
                  setVoucherCode(e.target.value.toUpperCase());
                  setValidationResult(null);
                }}
                className="bg-black/30 border-purple-500/30 text-white uppercase"
                disabled={redeeming}
              />
              <Button
                onClick={validateVoucher}
                disabled={redeeming || !voucherCode.trim()}
                className="bg-gradient-to-r from-purple-600 to-pink-600"
              >
                {redeeming ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Checking...
                  </>
                ) : (
                  'Validate'
                )}
              </Button>
            </div>

            {/* Validation Result */}
            {validationResult && (
              <div
                className={`p-4 rounded-lg border ${
                  validationResult.valid
                    ? 'bg-green-500/10 border-green-500/30'
                    : 'bg-red-500/10 border-red-500/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  {validationResult.valid ? (
                    <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p
                      className={`font-medium ${
                        validationResult.valid ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      {validationResult.message}
                    </p>
                    {validationResult.valid && validationResult.voucher && (
                      <div className="mt-3 space-y-2">
                        <p className="text-white text-lg font-bold">
                          {getDiscountText(validationResult.voucher)}
                        </p>
                        {validationResult.voucher.min_purchase_amount && (
                          <p className="text-sm text-gray-400">
                            Minimum purchase: ${validationResult.voucher.min_purchase_amount.toFixed(2)}
                          </p>
                        )}
                        <p className="text-sm text-gray-400">
                          Valid until {new Date(validationResult.voucher.valid_until).toLocaleDateString()}
                        </p>
                        <Button
                          onClick={redeemVoucher}
                          disabled={redeeming}
                          className="mt-2 bg-gradient-to-r from-green-600 to-emerald-600"
                        >
                          {redeeming ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Redeeming...
                            </>
                          ) : (
                            'Redeem Now'
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* My Vouchers */}
        <Card className="bg-black/40 backdrop-blur-lg border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white">My Vouchers</CardTitle>
          </CardHeader>
          <CardContent>
            {myVouchers.length === 0 ? (
              <div className="text-center py-12">
                <Ticket className="h-16 w-16 mx-auto text-gray-600 mb-4" />
                <p className="text-gray-400">No vouchers yet</p>
                <p className="text-sm text-gray-500 mt-2">
                  Redeem a voucher code to get started!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {myVouchers.map((voucher) => {
                  const expired = isVoucherExpired(voucher);
                  
                  return (
                    <div
                      key={voucher.id}
                      className={`p-4 rounded-lg border ${
                        expired
                          ? 'bg-gray-500/10 border-gray-500/20'
                          : 'bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Ticket className={`h-5 w-5 ${expired ? 'text-gray-500' : 'text-purple-400'}`} />
                            <span className={`font-mono font-bold text-lg ${expired ? 'text-gray-500' : 'text-white'}`}>
                              {voucher.code}
                            </span>
                          </div>
                          <p className={`text-xl font-bold mb-1 ${expired ? 'text-gray-500' : 'text-purple-400'}`}>
                            {getDiscountText(voucher)}
                          </p>
                          {voucher.min_purchase_amount && (
                            <p className="text-sm text-gray-400">
                              Min. purchase: ${voucher.min_purchase_amount.toFixed(2)}
                            </p>
                          )}
                          <p className="text-sm text-gray-400">
                            Redeemed on {new Date(voucher.redeemed_at!).toLocaleDateString()}
                          </p>
                          <p className={`text-sm ${expired ? 'text-red-400' : 'text-gray-400'}`}>
                            {expired ? 'Expired' : `Valid until ${new Date(voucher.valid_until).toLocaleDateString()}`}
                          </p>
                        </div>
                        {!expired && (
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-yellow-400" />
                            <span className="text-sm text-yellow-400">
                              Available at checkout
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
