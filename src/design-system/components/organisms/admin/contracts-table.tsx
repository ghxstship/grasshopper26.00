/**
 * ContractsTable Component
 * GHXSTSHIP Design System - Admin Contracts Table
 */

'use client';

import Link from 'next/link';
import tableStyles from './table-shared.module.css';
import { Badge } from '@/design-system/components/atoms';

interface Contract {
  id: string;
  contract_name: string;
  contract_status: string;
  contract_value: number;
  vendor_id: string;
  event_id: string;
  created_at: string;
  updated_at: string;
}

interface ContractsTableProps {
  contracts: Contract[];
}

export function ContractsTable({ contracts }: ContractsTableProps) {
  const getStatusVariant = (status: string): 'default' | 'solid' | 'outline' => {
    switch (status) {
      case 'active':
        return 'default';
      case 'pending_signature':
        return 'outline';
      case 'draft':
        return 'outline';
      case 'expired':
        return 'solid';
      case 'terminated':
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
            <th>Contract Name</th>
            <th>Value</th>
            <th>Status</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {contracts.map((contract) => (
            <tr key={contract.id}>
              <td>
                <Link
                  href={`/organization/contracts/${contract.id}`}
                  className={tableStyles.tableLink}
                >
                  {contract.contract_name}
                </Link>
              </td>
              <td>{formatCurrency(contract.contract_value || 0)}</td>
              <td>
                <Badge variant={getStatusVariant(contract.contract_status)}>
                  {contract.contract_status.replace('_', ' ').toUpperCase()}
                </Badge>
              </td>
              <td>{formatDate(contract.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
