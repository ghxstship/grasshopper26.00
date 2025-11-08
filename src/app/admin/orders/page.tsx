'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Download, RefreshCw, Eye } from 'lucide-react';
import Link from 'next/link';

interface Order {
  id: string;
  created_at: string;
  total_amount: number;
  status: string;
  user_id: string;
  events?: {
    name: string;
    slug: string;
  };
  tickets?: any[];
}

export default function AdminOrdersPage() {
  const supabase = createClient();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('orders')
        .select(`
          *,
          events (name, slug),
          tickets (id)
        `)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  }, [supabase, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = orders.filter(order => {
    const searchLower = searchTerm.toLowerCase();
    return (
      order.id.toLowerCase().includes(searchLower) ||
      order.events?.name.toLowerCase().includes(searchLower) ||
      order.user_id.toLowerCase().includes(searchLower)
    );
  });

  const statusColors: Record<string, string> = {
    completed: 'bg-green-500/20 text-green-400 border-green-500/30',
    pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
    refunded: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  };

  const exportOrders = () => {
    const csv = [
      ['Order ID', 'Date', 'Event', 'Amount', 'Status', 'Tickets'].join(','),
      ...filteredOrders.map(order => [
        order.id.slice(0, 8),
        new Date(order.created_at).toLocaleDateString(),
        order.events?.name || 'N/A',
        order.total_amount,
        order.status,
        order.tickets?.length || 0
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Order Management
            </h1>
            <p className="text-gray-400 mt-2">View and manage all orders</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={fetchOrders}
              variant="outline"
              className="border-purple-500/30"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button
              onClick={exportOrders}
              className="bg-gradient-to-r from-purple-600 to-pink-600"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        <Card className="bg-black/40 backdrop-blur-lg border-purple-500/20 mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by order ID, event, or user..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-black/50 border-purple-500/30"
                />
              </div>
              <div className="flex gap-2">
                {['all', 'completed', 'pending', 'cancelled', 'refunded'].map((status) => (
                  <Button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    variant={statusFilter === status ? 'default' : 'outline'}
                    className={statusFilter === status 
                      ? 'bg-purple-600' 
                      : 'border-purple-500/30'
                    }
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <Card className="bg-black/40 backdrop-blur-lg border-purple-500/20">
            <CardContent className="p-12 text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-400" />
              <p className="text-gray-400">Loading orders...</p>
            </CardContent>
          </Card>
        ) : filteredOrders.length === 0 ? (
          <Card className="bg-black/40 backdrop-blur-lg border-purple-500/20">
            <CardContent className="p-12 text-center">
              <p className="text-gray-400">No orders found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="bg-black/40 backdrop-blur-lg border-purple-500/20 hover:bg-black/60 transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <h3 className="text-lg font-bold text-white">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </h3>
                        <Badge className={statusColors[order.status] || statusColors.pending}>
                          {order.status}
                        </Badge>
                      </div>
                      <div className="grid md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-400">Event</p>
                          <p className="text-white font-medium">
                            {order.events?.name || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400">Date</p>
                          <p className="text-white">
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400">Amount</p>
                          <p className="text-white font-bold">
                            ${order.total_amount.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400">Tickets</p>
                          <p className="text-white">
                            {order.tickets?.length || 0}
                          </p>
                        </div>
                      </div>
                    </div>
                    <Link href={`/admin/orders/${order.id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-purple-500/30"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
