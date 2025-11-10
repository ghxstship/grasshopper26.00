'use client';
import { useEffect, useState } from 'react';

export function useInvestorAnalytics() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total_investment: 0, roi: 0, active_investors: 0, avg_return: 0 });

  useEffect(() => {
    setTimeout(() => { setStats({ total_investment: 2500000, roi: 18.5, active_investors: 45, avg_return: 15.2 }); setLoading(false); }, 500);
  }, []);

  return { stats, loading };
}
