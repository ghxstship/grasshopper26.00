'use client';
import { useEffect, useState } from 'react';

export function useSponsorAnalytics() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total_sponsors: 0, revenue: 0, impressions: 0, engagement: 0 });

  useEffect(() => {
    setTimeout(() => { setStats({ total_sponsors: 28, revenue: 450000, impressions: 1250000, engagement: 4.8 }); setLoading(false); }, 500);
  }, []);

  return { stats, loading };
}
