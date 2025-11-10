import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/components/atoms/card';
import styles from './page.module.css';
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
    <div className={styles.section}>
      {/* Page header */}
      <div>
        <h1 className={styles.title}>Dashboard</h1>
        <p className={styles.subtitle}>Welcome back! Here&apos;s what&apos;s happening today.</p>
      </div>

      {/* Stats grid */}
      <div className={styles.grid}>
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className={styles.row}>
              <CardTitle className={styles.statTitle}>
                {stat.name}
              </CardTitle>
              <stat.icon className={styles.statIcon} />
            </CardHeader>
            <CardContent>
              <div className={styles.statValue}>{stat.value}</div>
              <div className={styles.statChange}>
                {stat.changeType === 'positive' ? (
                  <TrendingUp className={`${styles.changeIcon} ${styles.changeIconPositive}`} />
                ) : (
                  <TrendingDown className={`${styles.changeIcon} ${styles.changeIconNegative}`} />
                )}
                <span className={stat.changeType === 'positive' ? styles.changeTextPositive : styles.changeTextNegative}>
                  {stat.change}
                </span>
                <span className={styles.changeLabel}>from last month</span>
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
          <div className={styles.orderList}>
            {recentOrders && recentOrders.length > 0 ? (
              recentOrders.map((order: any) => (
                <div
                  key={order.id}
                  className={styles.orderItem}
                >
                  <div>
                    <p className={styles.orderUser}>
                      {order.user_profiles?.display_name || 'Guest'}
                    </p>
                    <p className={styles.orderDate}>
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className={styles.orderDetails}>
                    <p className={styles.orderAmount}>
                      ${parseFloat(order.total_amount).toFixed(2)}
                    </p>
                    <span className={`${styles.statusBadge} ${
                      order.status === 'completed'
                        ? styles.statusCompleted
                        : order.status === 'pending'
                        ? styles.statusPending
                        : styles.statusDefault
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className={styles.emptyState}>No recent orders</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
