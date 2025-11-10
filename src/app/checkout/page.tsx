'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/store/cart-store';
import { Button } from '@/design-system/components/atoms/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/components/atoms/card';
import { Input } from '@/design-system/components/atoms/input';
import { Label } from '@/design-system/components/atoms/label';
import { Loader2, CreditCard, Lock } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function CheckoutForm() {
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();
  const { items, getTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success`,
          receipt_email: email,
        },
      });

      if (error) {
        console.error('Payment error:', error);
        alert(error.message);
      }
    } catch (err) {
      console.error('Checkout error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="bg-white border-3 border-black">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
            />
          </div>
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="John Doe"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border-3 border-black">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Payment Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PaymentElement />
        </CardContent>
      </Card>

      <Button
        type="submit"
        disabled={!stripe || loading}
        className="w-full"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          `Pay $${(getTotal() * 1.05).toFixed(2)}`
        )}
      </Button>

      <p className="font-share text-meta text-grey-600 text-center">
        Your payment information is secure and encrypted. We never store your card details.
      </p>
    </form>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const supabase = createClient();
  const { items, getTotal } = useCart();
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(true);

  const createPaymentIntent = useCallback(async () => {
    try {
      const response = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });

      const data = await response.json();
      setClientSecret(data.clientSecret);
    } catch (error) {
      console.error('Error creating payment intent:', error);
    } finally {
      setLoading(false);
    }
  }, [items]);

  const checkAuth = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push('/login?redirect=/checkout');
      return;
    }

    if (items.length === 0) {
      router.push('/cart');
      return;
    }

    await createPaymentIntent();
  }, [router, supabase, items, createPaymentIntent]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="h-12 w-12 animate-spin text-black" />
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="font-share text-body text-black">Failed to initialize checkout. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 bg-white border-b-3 border-black">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-anton text-hero uppercase text-black mb-8 pb-8 border-b-3 border-black">
          Checkout
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm />
            </Elements>
          </div>

          <div className="lg:col-span-1">
            <Card className="bg-grey-100 border-3 border-black sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between font-share text-meta">
                      <span className="text-grey-600">
                        {item.name} x{item.quantity}
                      </span>
                      <span className="text-black">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t-3 border-black pt-4 space-y-2">
                  <div className="flex justify-between font-share text-base text-grey-600">
                    <span>Subtotal</span>
                    <span>${getTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-share text-base text-grey-600">
                    <span>Service Fee</span>
                    <span>${(getTotal() * 0.05).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bebas text-xl uppercase text-black">
                    <span>Total</span>
                    <span>${(getTotal() * 1.05).toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
