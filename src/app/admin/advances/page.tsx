'use client';

import styles from './page.module.css';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AdminListTemplate } from '@/design-system/components/templates';
import { GeometricIcon } from '@/design-system/components/atoms/GeometricIcon';
import { StatusBadge, AdvanceStatus } from '@/design-system/components/atoms/StatusBadge';
import { ProductionAdvance } from '@/lib/types/production-advances';
import { cn } from '@/lib/utils';

type FilterStatus = 'all' | AdvanceStatus;

export default function AdminAdvancesQueuePage() {
  const router = useRouter();
  const [advances, setAdvances] = useState<ProductionAdvance[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>('submitted');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchAdvances = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') {
        params.append('status', filter);
      }
      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const response = await fetch(`/api/admin/advances?${params.toString()}`);
      const data = await response.json();
      setAdvances(data.advances || []);
    } catch (error) {
      console.error('Error fetching advances:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvances();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const isUrgent = (advance: ProductionAdvance) => {
    const startDate = new Date(advance.service_start_date);
    const now = new Date();
    const daysUntilStart = Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilStart <= 7 && advance.status === 'submitted';
  };

  const filterTabs: Array<{ key: FilterStatus; label: string }> = [
    { key: 'submitted', label: 'Pending Review' },
    { key: 'under_review', label: 'Under Review' },
    { key: 'approved', label: 'Approved' },
    { key: 'fulfilled', label: 'Fulfilled' },
    { key: 'all', label: 'All' },
  ];

  const stats = {
    pending: advances.filter((a) => a.status === 'submitted').length,
    underReview: advances.filter((a) => a.status === 'under_review').length,
    approved: advances.filter((a) => a.status === 'approved').length,
  };

  return (
    <AdminListTemplate
      title="PRODUCTION ADVANCES"
      subtitle="Manage and review production advance requests"
      stats={[
        { label: "Pending Review", value: stats.pending },
        { label: "Under Review", value: stats.underReview },
        { label: "Awaiting Fulfillment", value: stats.approved }
      ]}
      tabs={filterTabs}
      activeTab={filter}
      onTabChange={(key) => setFilter(key as FilterStatus)}
      searchPlaceholder="Search by advance number, event, company..."
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      onSearch={fetchAdvances}
      loading={loading}
      empty={advances.length === 0 ? {
        icon: <GeometricIcon name="clipboard" size="xl" />,
        title: "No advances found",
        description: filter === 'all' ? 'No advances in the system' : `No ${filter} advances`
      } : undefined}
    >
      {advances.length > 0 && (
          <div>
            <table className={styles.table}>
              <thead className={styles.tableHead}>
                <tr>
                  <th className={styles.tableHeader}>
                    Advance #
                  </th>
                  <th className={styles.tableHeader}>
                    Event
                  </th>
                  <th className={styles.tableHeader}>
                    Company
                  </th>
                  <th className={styles.tableHeader}>
                    Service Dates
                  </th>
                  <th className={styles.tableHeader}>
                    Items
                  </th>
                  <th className={styles.tableHeader}>
                    Status
                  </th>
                  <th className={styles.tableHeader}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {advances.map((advance) => (
                  <tr
                    key={advance.id}
                    className={cn(
                      styles.tableRow,
                      isUrgent(advance) && styles.tableRowUrgent
                    )}
                  >
                    <td className={styles.tableCell}>
                      <Link
                        href={`/admin/advances/${advance.id}`}
                        className={styles.advanceLink}
                      >
                        {advance.advance_number}
                      </Link>
                      {isUrgent(advance) && (
                        <span className={styles.urgentBadge}>
                          <GeometricIcon name="alert" size="xs" />
                          URGENT
                        </span>
                      )}
                    </td>
                    <td className={styles.tableCell}>
                      <p className={styles.eventName}>{advance.event_name}</p>
                    </td>
                    <td className={styles.tableCell}>
                      <p className={styles.companyName}>{advance.company_name}</p>
                      <p className={styles.contactName}>
                        {advance.point_of_contact_name}
                      </p>
                    </td>
                    <td className={styles.tableCell}>
                      <p className={styles.dateText}>
                        {formatDate(advance.service_start_date)} - {formatDate(advance.service_end_date)}
                      </p>
                      <p className={styles.durationText}>
                        {advance.duration_days} days
                      </p>
                    </td>
                    <td className={cn(styles.tableCell, styles.tableCellCenter)}>
                      <p className={styles.itemCount}>{advance.total_items}</p>
                    </td>
                    <td className={styles.tableCell}>
                      <StatusBadge status={advance.status} size="sm" />
                    </td>
                    <td className={styles.tableCell}>
                      <div className={styles.actionButtons}>
                        <Link
                          href={`/admin/advances/${advance.id}`}
                          className={styles.reviewLink}
                        >
                          <GeometricIcon name="arrow-right" size="xs" />
                          REVIEW
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
      )}
    </AdminListTemplate>
  );
}
