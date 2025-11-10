'use client';
import { useState, useEffect } from 'react';
export function useAdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  useEffect(() => { setTimeout(() => { setOrders([]); setStats({ total: 856, pending: 24, completed: 832 }); setLoading(false); }, 500); }, []);
  return { orders, stats, loading, searchQuery, setSearchQuery };
}
