'use client';
import { useState, useEffect } from 'react';
export function useSchedule() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { setTimeout(() => { setEvents([]); setLoading(false); }, 500); }, []);
  return { events, loading };
}
