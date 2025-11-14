/**
 * useAdminEquipment Hook
 * Manages equipment data for admin interface
 */

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Equipment {
  id: string;
  equipment_name: string;
  model_number: string;
  condition_status: string;
  is_available: boolean;
  current_location: string;
  created_at: string;
  updated_at: string;
}

interface EquipmentStats {
  total: number;
  available: number;
  in_use: number;
}

export function useAdminEquipment() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [stats, setStats] = useState<EquipmentStats>({
    total: 0,
    available: 0,
    in_use: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchEquipment() {
      const supabase = createClient();
      
      try {
        const { data, error } = await supabase
          .from('equipment')
          .select('*')
          .order('equipment_name');

        if (error) throw error;

        setEquipment(data || []);
        
        // Calculate stats
        const total = data?.length || 0;
        const available = data?.filter((e: Equipment) => e.is_available).length || 0;
        const in_use = total - available;

        setStats({ total, available, in_use });
      } catch (error) {
        console.error('Error fetching equipment:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchEquipment();
  }, []);

  // Filter equipment based on search query
  const filteredEquipment = equipment.filter(item =>
    item.equipment_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.model_number?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return {
    equipment: filteredEquipment,
    stats,
    loading,
    searchQuery,
    setSearchQuery,
  };
}
