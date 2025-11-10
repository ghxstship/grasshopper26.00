'use client';
import { useState, useEffect } from 'react';
export function useAdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, in_stock: 0, out_of_stock: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  useEffect(() => { setTimeout(() => { setProducts([]); setStats({ total: 45, in_stock: 38, out_of_stock: 7 }); setLoading(false); }, 500); }, []);
  return { products, stats, loading, searchQuery, setSearchQuery };
}
