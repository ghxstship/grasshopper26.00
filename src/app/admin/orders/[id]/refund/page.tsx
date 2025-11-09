'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/design-system/components/atoms/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/components/atoms/card';
import { ArrowLeft, DollarSign, Loader2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function RefundOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('requested_by_customer');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    async function fetchOrder() {
      try {
        const response = await fetch(`/api/admin/orders/${id}`);
        const data = await response.json();
        
        if (data.order) {
          setOrder(data.order);
          setRefundAmount(data.order.total_amount);
        }
      } catch (error) {
        console.error('Failed to fetch order:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!window.confirm('Are you sure you want to process this refund? This action cannot be undone.')) {
      return;
    }

    setProcessing(true);

    try {
      const response = await fetch(`/api/admin/orders/${id}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(refundAmount),
          reason: refundReason,
          notes,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Refund processed successfully');
        router.push(`/admin/orders/${id}`);
      } else {
        alert(data.error || 'Failed to process refund');
      }
    } catch (error) {
      console.error('Refund error:', error);
      alert('Failed to process refund');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black flex items-center justify-center">
        <p className="text-white">Order not found</p>
      </div>
    );
  }

  const maxRefund = parseFloat(order.total_amount);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link
            href={`/admin/orders/${id}`}
            className="text-purple-400 hover:text-purple-300 mb-4 inline-flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Order
          </Link>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Process Refund
          </h1>
        </div>

        {/* Warning */}
        <Card className="bg-yellow-500/10 border-yellow-500/30 mb-6">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-yellow-500 flex-shrink-0" />
              <div>
                <h3 className="text-yellow-500 font-semibold mb-1">Warning</h3>
                <p className="text-yellow-200/80 text-sm">
                  This action will process a refund through Stripe and cannot be undone. 
                  The customer will receive the refund within 5-10 business days.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Info */}
        <Card className="bg-black/40 backdrop-blur-lg border-purple-500/20 mb-6">
          <CardHeader>
            <CardTitle>Order Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Order ID</p>
                <p className="text-white font-mono">#{order.id.slice(0, 8).toUpperCase()}</p>
              </div>
              <div>
                <p className="text-gray-400">Total Amount</p>
                <p className="text-white font-bold">${parseFloat(order.total_amount).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-gray-400">Status</p>
                <p className="text-white capitalize">{order.status}</p>
              </div>
              <div>
                <p className="text-gray-400">Date</p>
                <p className="text-white">{new Date(order.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Refund Form */}
        <form onSubmit={handleSubmit}>
          <Card className="bg-black/40 backdrop-blur-lg border-purple-500/20 mb-6">
            <CardHeader>
              <CardTitle>Refund Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label htmlFor="refundAmount" className="block text-sm font-medium text-gray-300 mb-2">
                  Refund Amount *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="refundAmount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={maxRefund}
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-black/60 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Maximum refund: ${maxRefund.toFixed(2)}
                </p>
              </div>

              <div>
                <label htmlFor="refundReason" className="block text-sm font-medium text-gray-300 mb-2">
                  Refund Reason *
                </label>
                <select
                  id="refundReason"
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-black/60 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="requested_by_customer">Requested by Customer</option>
                  <option value="duplicate">Duplicate Order</option>
                  <option value="fraudulent">Fraudulent</option>
                  <option value="event_cancelled">Event Cancelled</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-300 mb-2">
                  Internal Notes
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Add any internal notes about this refund..."
                  className="w-full px-4 py-3 bg-black/60 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={processing}
              className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
            >
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <DollarSign className="h-4 w-4 mr-2" />
                  Process Refund
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/admin/orders/${id}`)}
              className="border-purple-500/30 hover:bg-purple-500/10"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
