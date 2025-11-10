'use client';
import { useState, useEffect } from 'react';
export function useAdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, members: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  useEffect(() => { setTimeout(() => { setUsers([]); setStats({ total: 1240, active: 980, members: 340 }); setLoading(false); }, 500); }, []);
  return { users, stats, loading, searchQuery, setSearchQuery };
}
