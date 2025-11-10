'use client';
import { useEffect, useState } from 'react';

export function useAdminAnalytics() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ revenue: 0, active_users: 0, conversion_rate: 0, avg_order_value: 0 });

  useEffect(() => {
    setTimeout(() => {
      setStats({ revenue: 125000, active_users: 3420, conversion_rate: 3.2, avg_order_value: 85 });
      setLoading(false);
    }, 500);
  }, []);

  return { stats, loading };
}
