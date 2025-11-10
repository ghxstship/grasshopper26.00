'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ContextualPageTemplate } from '@/design-system/components/templates';
import { Button } from '@/design-system/components/atoms/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/components/atoms/Card';
import { Input } from '@/design-system/components/atoms/Input';
import { Label } from '@/design-system/components/atoms/Label';
import { Textarea } from '@/design-system/components/atoms/Textarea';
import { DollarSign, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import styles from './refund-content.module.css';

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
        toast.error('Failed to load order');
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
        toast.success('Refund processed successfully');
        router.push(`/admin/orders/${id}`);
      } else {
        toast.error(data.error || 'Failed to process refund');
      }
    } catch (error) {
      console.error('Refund error:', error);
      toast.error('Failed to process refund');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ContextualPageTemplate
      breadcrumbs={[
        { label: 'Orders', href: '/admin/orders' },
        { label: `Order #${order?.order_number || id}`, href: `/admin/orders/${id}` },
        { label: 'Refund', href: `/admin/orders/${id}/refund` }
      ]}
      title="Process Refund"
      subtitle={order ? `Order #${order.order_number} - ${order.customer_name}` : 'Loading...'}
      loading={loading}
    >
      <Card>
        <CardHeader>
          <CardTitle>
            <AlertTriangle />
            Refund Order
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <Label htmlFor="amount">Refund Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                required
              />
            </div>

            <div className={styles.field}>
              <Label htmlFor="reason">Reason</Label>
              <select
                id="reason"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
className={styles.select}
              >
                <option value="requested_by_customer">Requested by Customer</option>
                <option value="duplicate">Duplicate Order</option>
                <option value="fraudulent">Fraudulent</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className={styles.field}>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
            </div>

            <div className={styles.actions}>
              <Button type="submit" disabled={processing}>
                <DollarSign />
                {processing ? 'Processing...' : 'Process Refund'}
              </Button>
              <Button type="button" variant="outlined" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </ContextualPageTemplate>
  );
}
