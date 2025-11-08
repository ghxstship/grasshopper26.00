import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Calendar, 
  Users, 
  ShoppingBag, 
  DollarSign,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Fetch dashboard KPIs
  const { data: kpis } = await supabase.rpc('get_dashboard_kpis');
  const dashboardData = kpis?.[0] || {};

  // Fetch recent orders
  const { data: recentOrders } = await supabase
    .from('orders')
    .select(`
      id,
      total_amount,
      status,
      created_at,
      user_profiles:user_id (
        display_name
      )
    `)
    .order('created_at', { ascending: false })
    .limit(5);

  // Calculate stats
  const totalRevenue = parseFloat(dashboardData.total_revenue || '0');
  const totalOrders = dashboardData.total_orders || 0;
  const totalEvents = dashboardData.total_events || 0;
  const totalUsers = dashboardData.total_users || 0;

  const stats = [
    {
      name: 'Total Revenue',
      value: `$${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      change: '+12.5%',
      changeType: 'positive' as const,
    },
    {
      name: 'Total Orders',
      value: totalOrders.toLocaleString(),
      icon: ShoppingBag,
      change: '+8.2%',
      changeType: 'positive' as const,
    },
    {
      name: 'Active Events',
      value: totalEvents.toLocaleString(),
      icon: Calendar,
      change: '+3',
      changeType: 'positive' as const,
    },
    {
      name: 'Total Users',
      value: totalUsers.toLocaleString(),
      icon: Users,
      change: '+15.3%',
      changeType: 'positive' as const,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back! Here&apos;s what&apos;s happening today.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.name}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center mt-1">
                {stat.changeType === 'positive' ? (
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm ${
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
                <span className="text-sm text-gray-500 ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentOrders && recentOrders.length > 0 ? (
              recentOrders.map((order: any) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between py-3 border-b last:border-0"
                >
                  <div>
                    <p className="font-medium">
                      {order.user_profiles?.display_name || 'Guest'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      ${parseFloat(order.total_amount).toFixed(2)}
                    </p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      order.status === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : order.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">No recent orders</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
