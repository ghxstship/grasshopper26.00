'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Mail, Ticket, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/lib/store/cart-store';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clearCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState<any>(null);

  const confirmPayment = useCallback(async (paymentIntentId: string) => {
    try {
      const response = await fetch('/api/checkout/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentIntentId }),
      });

      const data = await response.json();
      
      if (data.success) {
        setOrderDetails(data.order);
        clearCart();
      }
    } catch (error) {
      console.error('Error confirming payment:', error);
    } finally {
      setLoading(false);
    }
  }, [clearCart]);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (sessionId) {
      confirmPayment(sessionId);
    } else {
      router.push('/cart');
    }
  }, [searchParams, confirmPayment, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-purple-950 to-black">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-white">Confirming your order...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-black/40 backdrop-blur-lg border-purple-500/20">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl">Order Confirmed!</CardTitle>
            <p className="text-gray-400 mt-2">
              Thank you for your purchase. Your order has been successfully processed.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {orderDetails && (
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Order Number</p>
                    <p className="text-white font-mono">#{orderDetails.id.slice(0, 8)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Total Amount</p>
                    <p className="text-white font-bold">${orderDetails.total_amount}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-purple-400 mt-0.5" />
                <div>
                  <p className="text-white font-medium">Confirmation Email Sent</p>
                  <p className="text-sm text-gray-400">
                    We&apos;ve sent a confirmation email with your order details and tickets.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Ticket className="h-5 w-5 text-purple-400 mt-0.5" />
                <div>
                  <p className="text-white font-medium">Tickets Available</p>
                  <p className="text-sm text-gray-400">
                    Your tickets are now available in your profile.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Link href="/profile" className="flex-1">
                <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  View My Tickets
                </Button>
              </Link>
              <Link href="/events" className="flex-1">
                <Button variant="outline" className="w-full border-purple-500/30 hover:bg-purple-500/10">
                  Browse Events
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
