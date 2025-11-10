'use client';
import { useState, useEffect } from 'react';
export function useMembershipTiers() {
  const [tiers, setTiers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { setTimeout(() => { setTiers([]); setLoading(false); }, 500); }, []);
  return { tiers, loading };
}
