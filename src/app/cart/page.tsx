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
      <div className="min-h-screen py-12 px-4 bg-white border-b-3 border-black">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-20">
            <ShoppingBag className="h-24 w-24 mx-auto mb-6 text-grey-400" />
            <h1 className="font-anton text-hero uppercase text-black mb-4">Your cart is empty</h1>
            <p className="mb-8 font-share text-body text-grey-600">Add some tickets or merchandise to get started!</p>
            <div className="flex gap-4 justify-center">
              <Link href="/events">
                <Button>
                  Browse Events
                </Button>
              </Link>
              <Link href="/shop">
                <Button variant="outline">
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
    <div className="min-h-screen py-12 px-4 bg-white border-b-3 border-black">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8 pb-8 border-b-3 border-black">
          <h1 className="font-anton text-hero uppercase text-black">
            Shopping Cart
          </h1>
          <Button
            variant="outline"
            onClick={clearCart}
          >
            Clear Cart
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.id} className="bg-white border-3 border-black">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    {/* Item Image */}
                    {item.image && (
                      <div className="relative w-24 h-24 border-3 border-black overflow-hidden flex-shrink-0">
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
                          <h3 className="font-bebas text-lg uppercase text-black">{item.name}</h3>
                          {item.eventName && (
                            <p className="font-share text-meta text-grey-600">{item.eventName}</p>
                          )}
                          {item.variant && (
                            <p className="font-share text-meta text-grey-500">
                              {item.variant.size && `Size: ${item.variant.size}`}
                              {item.variant.color && ` • Color: ${item.variant.color}`}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
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
                            className="h-8 w-8 p-0"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center font-bebas text-base text-black">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="h-8 w-8 p-0"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <p className="font-bebas text-xl uppercase text-black">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                          {item.quantity > 1 && (
                            <p className="font-share text-meta text-grey-500">
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
            <Card className="bg-grey-100 border-3 border-black sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between font-share text-base text-grey-600">
                    <span>Subtotal</span>
                    <span>${getTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-share text-base text-grey-600">
                    <span>Service Fee</span>
                    <span>${(getTotal() * 0.05).toFixed(2)}</span>
                  </div>
                  <div className="pt-2 border-t-3 border-black">
                    <div className="flex justify-between font-bebas text-xl uppercase text-black">
                      <span>Total</span>
                      <span>${(getTotal() * 1.05).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleCheckout}
                  className="w-full"
                >
                  Proceed to Checkout
                </Button>

                <Link href="/events">
                  <Button variant="outline" className="w-full">
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
