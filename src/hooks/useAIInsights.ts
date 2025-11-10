'use client';
import { useEffect, useState } from 'react';

export function useAIInsights() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ predictions: 0, accuracy: 0, recommendations: 0, impact: 0 });

  useEffect(() => {
    setTimeout(() => { setStats({ predictions: 156, accuracy: 87, recommendations: 42, impact: 12 }); setLoading(false); }, 500);
  }, []);

  return { stats, loading };
}
