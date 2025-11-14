/**
 * CampaignsTable Component
 * GHXSTSHIP Design System - Admin Campaigns Table
 */

'use client';

import Link from 'next/link';
import tableStyles from './table-shared.module.css';
import { Badge } from '@/design-system/components/atoms';

interface Campaign {
  id: string;
  campaign_name: string;
  campaign_type: string;
  campaign_status: string;
  budgeted_amount: number;
  actual_spend: number;
  target_reach: number;
  actual_reach: number;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
}

interface CampaignsTableProps {
  campaigns: Campaign[];
}

export function CampaignsTable({ campaigns }: CampaignsTableProps) {
  const getStatusVariant = (status: string): 'default' | 'solid' | 'outline' => {
    switch (status) {
      case 'active':
        return 'default';
      case 'scheduled':
        return 'outline';
      case 'planning':
        return 'outline';
      case 'completed':
        return 'default';
      case 'cancelled':
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
            <th>Campaign Name</th>
            <th>Status</th>
            <th>Budget</th>
            <th>Start Date</th>
          </tr>
        </thead>
        <tbody>
          {campaigns.map((campaign) => (
            <tr key={campaign.id}>
              <td>{campaign.campaign_name}</td>
              <td>
                <Badge variant="default">
                  {campaign.campaign_status?.toUpperCase() || 'ACTIVE'}
                </Badge>
              </td>
              <td>{formatCurrency(campaign.budgeted_amount || 0)}</td>
              <td>{campaign.start_date ? new Date(campaign.start_date).toLocaleDateString() : 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
