'use client';
import { useEffect, useState } from 'react';

export function useReports() {
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, this_month: 0 });

  useEffect(() => {
    setTimeout(() => { setReports([]); setStats({ total: 48, this_month: 12 }); setLoading(false); }, 500);
  }, []);

  return { reports, stats, loading };
}
