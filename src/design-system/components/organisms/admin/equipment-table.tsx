/**
 * EquipmentTable Component
 * GHXSTSHIP Design System - Admin Equipment Table
 */

'use client';

import Link from 'next/link';
import tableStyles from './table-shared.module.css';
import { Badge } from '@/design-system/components/atoms';

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

interface EquipmentTableProps {
  equipment: Equipment[];
}

export function EquipmentTable({ equipment }: EquipmentTableProps) {
  const getConditionVariant = (status: string): 'default' | 'solid' | 'outline' => {
    switch (status) {
      case 'excellent':
      case 'good':
        return 'default';
      case 'fair':
        return 'outline';
      case 'poor':
      case 'needs_repair':
        return 'solid';
      default:
        return 'outline';
    }
  };

  return (
    <div className={tableStyles.tableContainer}>
      <table className={tableStyles.table}>
        <thead>
          <tr>
            <th>Equipment Name</th>
            <th>Model</th>
            <th>Availability</th>
            <th>Location</th>
          </tr>
        </thead>
        <tbody>
          {equipment.map((item) => (
            <tr key={item.id}>
              <td>
                <Link
                  href={`/organization/equipment/${item.id}`}
                  className={tableStyles.tableLink}
                >
                  {item.equipment_name}
                </Link>
              </td>
              <td>{item.model_number || 'N/A'}</td>
              <td>
                <Badge variant={item.is_available ? 'default' : 'solid'}>
                  {item.is_available ? 'AVAILABLE' : 'IN USE'}
                </Badge>
              </td>
              <td>{item.current_location || 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
