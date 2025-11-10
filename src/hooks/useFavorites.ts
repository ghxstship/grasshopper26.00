'use client';
import { useState, useEffect } from 'react';
export function useFavorites() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { setTimeout(() => { setFavorites([]); setLoading(false); }, 500); }, []);
  return { favorites, loading };
}
