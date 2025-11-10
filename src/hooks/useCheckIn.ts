'use client';
import { useEffect, useState } from 'react';

export function useCheckIn() {
  const [loading, setLoading] = useState(true);
  const [checkIns, setCheckIns] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, today: 0, pending: 0 });

  useEffect(() => {
    setTimeout(() => { setCheckIns([]); setStats({ total: 1240, today: 85, pending: 12 }); setLoading(false); }, 500);
  }, []);

  return { checkIns, stats, loading };
}
