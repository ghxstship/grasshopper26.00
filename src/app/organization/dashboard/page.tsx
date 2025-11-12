import { createClient } from '@/lib/supabase/server';
import { AdminLayout } from '@/design-system/components/templates/AdminLayout/AdminLayout';
import { AdminSidebar } from '@/design-system/components/organisms/AdminSidebar/AdminSidebar';
import { StatCard } from '@/design-system/components/molecules/StatCard/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/components/atoms/Card';
import styles from './page.module.css';
import { 
  Calendar, 
  Users, 
  ShoppingBag, 
  DollarSign,
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

  return (
    <AdminLayout
      sidebar={<AdminSidebar />}
      title="Dashboard"
      description="Welcome back! Here's what's happening today."
    >
      {/* Stats grid */}
      <div className={styles.grid}>
        <StatCard
          label="Total Revenue"
          value={`$${totalRevenue.toLocaleString()}`}
          icon={<DollarSign />}
        />
        <StatCard
          label="Total Orders"
          value={totalOrders.toLocaleString()}
          icon={<ShoppingBag />}
        />
        <StatCard
          label="Active Events"
          value={totalEvents.toLocaleString()}
          icon={<Calendar />}
        />
        <StatCard
          label="Total Users"
          value={totalUsers.toLocaleString()}
          icon={<Users />}
        />
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
    </AdminLayout>
  );
}
