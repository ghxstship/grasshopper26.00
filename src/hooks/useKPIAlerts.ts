'use client';
import { useEffect, useState } from 'react';

export function useKPIAlerts() {
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [stats, setStats] = useState({ active: 0, triggered_today: 0 });

  useEffect(() => {
    setTimeout(() => { setAlerts([]); setStats({ active: 5, triggered_today: 2 }); setLoading(false); }, 500);
  }, []);

  return { alerts, stats, loading };
}
