'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, ShoppingCart, Ticket, Calendar, TrendingUp, Users } from 'lucide-react';

interface AnalyticsData {
  summary: {
    totalRevenue: number;
    totalOrders: number;
    pendingOrders: number;
    totalTickets: number;
    upcomingEvents: number;
    pastEvents: number;
    averageOrderValue: number;
  };
  charts: {
    revenue: Array<{ date: string; revenue: number }>;
  };
  recentOrders: any[];
  period: string;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/analytics?period=${period}`);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black flex items-center justify-center">
        <p className="text-white">Loading analytics...</p>
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Revenue',
      value: `$${data.summary.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
    },
    {
      title: 'Total Orders',
      value: data.summary.totalOrders.toString(),
      icon: ShoppingCart,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
    },
    {
      title: 'Tickets Sold',
      value: data.summary.totalTickets.toString(),
      icon: Ticket,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
    },
    {
      title: 'Upcoming Events',
      value: data.summary.upcomingEvents.toString(),
      icon: Calendar,
      color: 'text-pink-400',
      bgColor: 'bg-pink-500/20',
    },
    {
      title: 'Avg Order Value',
      value: `$${data.summary.averageOrderValue.toFixed(2)}`,
      icon: TrendingUp,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20',
    },
    {
      title: 'Pending Orders',
      value: data.summary.pendingOrders.toString(),
      icon: Users,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Analytics Dashboard
            </h1>
            <p className="text-gray-400 mt-2">Track your business performance</p>
          </div>
          <div className="flex gap-2">
            {['7d', '30d', '90d', '1y'].map((p) => (
              <Button
                key={p}
                onClick={() => setPeriod(p)}
                variant={period === p ? 'default' : 'outline'}
                className={period === p ? 'bg-purple-600' : 'border-purple-500/30'}
              >
                {p === '7d' && 'Last 7 Days'}
                {p === '30d' && 'Last 30 Days'}
                {p === '90d' && 'Last 90 Days'}
                {p === '1y' && 'Last Year'}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.title} className="bg-black/40 backdrop-blur-lg border-purple-500/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-white">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="bg-black/40 backdrop-blur-lg border-purple-500/20">
            <CardHeader>
              <CardTitle>Revenue Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-between gap-2">
                {data.charts.revenue.slice(-14).map((item, index) => {
                  const maxRevenue = Math.max(...data.charts.revenue.map(r => r.revenue));
                  const height = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
                  
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-gradient-to-t from-purple-600 to-pink-600 rounded-t transition-all hover:opacity-80"
                        style={{ height: `${height}%`, minHeight: item.revenue > 0 ? '4px' : '0' }}
                        title={`${item.date}: $${item.revenue.toFixed(2)}`}
                      />
                      <p className="text-xs text-gray-500 mt-2 rotate-45 origin-left">
                        {new Date(item.date).getDate()}
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-lg border-purple-500/20">
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.recentOrders.slice(0, 5).map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-purple-900/20 border border-purple-500/20"
                  >
                    <div>
                      <p className="font-medium text-white text-sm">
                        {order.events?.name || 'Order'}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-purple-400">
                        ${order.total_amount.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-400 capitalize">{order.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
