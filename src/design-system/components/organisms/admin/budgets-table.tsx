/**
 * BudgetsTable Component
 * GHXSTSHIP Design System - Admin Budgets Table
 */

'use client';

import Link from 'next/link';
import tableStyles from './table-shared.module.css';
import { Badge } from '@/design-system/components/atoms';

interface Budget {
  id: string;
  budget_name: string;
  budget_status: string;
  total_budgeted: number;
  total_actual: number;
  event_id: string;
  created_at: string;
  updated_at: string;
}

interface BudgetsTableProps {
  budgets: Budget[];
}

export function BudgetsTable({ budgets }: BudgetsTableProps) {
  const getStatusVariant = (status: string): 'default' | 'solid' | 'outline' => {
    switch (status) {
      case 'approved':
        return 'default';
      case 'pending_approval':
        return 'outline';
      case 'draft':
        return 'outline';
      case 'locked':
        return 'solid';
      case 'closed':
        return 'solid';
      default:
        return 'outline';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className={tableStyles.tableContainer}>
      <table className={tableStyles.table}>
        <thead>
          <tr>
            <th>Budget Name</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Period</th>
          </tr>
        </thead>
        <tbody>
          {budgets.map((budget) => (
            <tr key={budget.id}>
              <td>{budget.budget_name}</td>
              <td>{formatCurrency(budget.total_budgeted || 0)}</td>
              <td>
                <Badge variant="default">
                  {budget.budget_status?.replace('_', ' ').toUpperCase() || 'ACTIVE'}
                </Badge>
              </td>
              <td>{new Date(budget.created_at).getFullYear()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
