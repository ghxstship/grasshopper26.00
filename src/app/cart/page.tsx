'use client';

export const dynamic = 'force-dynamic';

import { useCart } from '@/lib/store/cart-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-20">
            <ShoppingBag className="h-24 w-24 mx-auto text-gray-600 mb-6" />
            <h1 className="text-3xl font-bold text-white mb-4">Your cart is empty</h1>
            <p className="text-gray-400 mb-8">Add some tickets or merchandise to get started!</p>
            <div className="flex gap-4 justify-center">
              <Link href="/events">
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  Browse Events
                </Button>
              </Link>
              <Link href="/shop">
                <Button variant="outline" className="border-purple-500/30 hover:bg-purple-500/10">
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
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Shopping Cart
          </h1>
          <Button
            variant="outline"
            onClick={clearCart}
            className="border-red-500/30 hover:bg-red-500/10 text-red-400"
          >
            Clear Cart
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.id} className="bg-black/40 backdrop-blur-lg border-purple-500/20">
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
                          <h3 className="font-semibold text-white">{item.name}</h3>
                          {item.eventName && (
                            <p className="text-sm text-gray-400">{item.eventName}</p>
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
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
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
                          <span className="text-white w-8 text-center">{item.quantity}</span>
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
                          <p className="text-lg font-bold text-white">
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
            <Card className="bg-black/40 backdrop-blur-lg border-purple-500/20 sticky top-4">
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
                  <div className="border-t border-purple-500/20 pt-2">
                    <div className="flex justify-between text-lg font-bold text-white">
                      <span>Total</span>
                      <span>${(getTotal() * 1.05).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleCheckout}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  Proceed to Checkout
                </Button>

                <Link href="/events">
                  <Button variant="outline" className="w-full border-purple-500/30 hover:bg-purple-500/10">
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
