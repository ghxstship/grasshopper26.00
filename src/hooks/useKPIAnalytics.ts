'use client';
import { useEffect, useState } from 'react';

export function useKPIAnalytics() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ active: 0, trending_up: 0, alerts: 0, on_target: 0 });

  useEffect(() => {
    setTimeout(() => { setStats({ active: 15, trending_up: 8, alerts: 3, on_target: 12 }); setLoading(false); }, 500);
  }, []);

  return { stats, loading };
}
