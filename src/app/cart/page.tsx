'use client';

export const dynamic = 'force-dynamic';

import { useCart } from '@/lib/store/cart-store';
import { Button } from '@/design-system/components/atoms/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/components/atoms/card';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCart();

  const handleCheckout = () => {
    router.push('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen py-12 px-4" style={{ background: 'var(--gradient-hero)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-20">
            <ShoppingBag className="h-24 w-24 mx-auto mb-6" style={{ color: 'var(--color-text-disabled)' }} />
            <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--color-text-inverse)' }}>Your cart is empty</h1>
            <p className="mb-8" style={{ color: 'var(--color-text-tertiary)' }}>Add some tickets or merchandise to get started!</p>
            <div className="flex gap-4 justify-center">
              <Link href="/events">
                <Button style={{ background: 'var(--gradient-brand-primary)' }}>
                  Browse Events
                </Button>
              </Link>
              <Link href="/shop">
                <Button variant="outline" style={{ borderColor: 'rgba(147,51,234,0.3)' }}>
                  Browse Shop
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4" style={{ background: 'var(--gradient-hero)' }}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent" style={{ backgroundImage: 'var(--gradient-brand-primary)' }}>
            Shopping Cart
          </h1>
          <Button
            variant="outline"
            onClick={clearCart}
            style={{ borderColor: 'rgba(239,68,68,0.3)', color: 'var(--color-error)' }}
          >
            Clear Cart
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.id} className="backdrop-blur-lg" style={{ backgroundColor: 'rgba(0,0,0,0.4)', borderColor: 'rgba(147,51,234,0.2)' }}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    {/* Item Image */}
                    {item.image && (
                      <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}

                    {/* Item Details */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold" style={{ color: 'var(--color-text-inverse)' }}>{item.name}</h3>
                          {item.eventName && (
                            <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>{item.eventName}</p>
                          )}
                          {item.variant && (
                            <p className="text-sm text-gray-400">
                              {item.variant.size && `Size: ${item.variant.size}`}
                              {item.variant.color && ` • Color: ${item.variant.color}`}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          style={{ color: 'var(--color-error)' }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex items-center justify-between">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="h-8 w-8 p-0 border-purple-500/30"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center" style={{ color: 'var(--color-text-inverse)' }}>{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="h-8 w-8 p-0 border-purple-500/30"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <p className="text-lg font-bold" style={{ color: 'var(--color-text-inverse)' }}>
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                          {item.quantity > 1 && (
                            <p className="text-sm text-gray-400">
                              ${item.price.toFixed(2)} each
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="backdrop-blur-lg sticky top-4" style={{ backgroundColor: 'rgba(0,0,0,0.4)', borderColor: 'rgba(147,51,234,0.2)' }}>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-400">
                    <span>Subtotal</span>
                    <span>${getTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Service Fee</span>
                    <span>${(getTotal() * 0.05).toFixed(2)}</span>
                  </div>
                  <div className="pt-2" style={{ borderTop: '1px solid rgba(147,51,234,0.2)' }}>
                    <div className="flex justify-between text-lg font-bold" style={{ color: 'var(--color-text-inverse)' }}>
                      <span>Total</span>
                      <span>${(getTotal() * 1.05).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleCheckout}
                  className="w-full"
                  style={{ background: 'var(--gradient-brand-primary)' }}
                >
                  Proceed to Checkout
                </Button>

                <Link href="/events">
                  <Button variant="outline" className="w-full" style={{ borderColor: 'rgba(147,51,234,0.3)' }}>
                    Continue Shopping
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
