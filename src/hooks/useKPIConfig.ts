'use client';
import { useEffect, useState } from 'react';

export function useKPIConfig() {
  const [loading, setLoading] = useState(true);
  const [configs, setConfigs] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0 });

  useEffect(() => {
    setTimeout(() => { setConfigs([]); setStats({ total: 12, active: 8 }); setLoading(false); }, 500);
  }, []);

  return { configs, stats, loading };
}
