'use client';
import { useState, useEffect } from 'react';
export function useAdminRoles() {
  const [roles, setRoles] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0 });
  const [loading, setLoading] = useState(true);
  useEffect(() => { setTimeout(() => { setRoles([]); setStats({ total: 8, active: 6 }); setLoading(false); }, 500); }, []);
  return { roles, stats, loading };
}
