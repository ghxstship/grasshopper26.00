'use client';
import { useState, useEffect } from 'react';
export function useCart() {
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  useEffect(() => { setTimeout(() => { setItems([]); setTotal(0); setLoading(false); }, 500); }, []);
  return { items, total, loading };
}
