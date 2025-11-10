'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GeometricIcon } from '@/design-system/components/atoms/GeometricIcon';
import { StatusBadge, AdvanceStatus } from '@/design-system/components/atoms/StatusBadge';
import { ProductionAdvance } from '@/lib/types/production-advances';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
import styles from './page.module.css';

type FilterStatus = 'all' | AdvanceStatus;

export default function MyAdvancesPage() {
  const router = useRouter();
  const [advances, setAdvances] = useState<ProductionAdvance[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>('all');

  useEffect(() => {
    const fetchAdvances = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filter !== 'all') {
          params.append('status', filter);
        }

        const response = await fetch(`/api/advances?${params.toString()}`);
        const data = await response.json();
        setAdvances(data.advances || []);
      } catch (error) {
        console.error('Error fetching advances:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdvances();
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

  const filterTabs: Array<{ key: FilterStatus; label: string }> = [
    { key: 'all', label: 'All' },
    { key: 'draft', label: 'Drafts' },
    { key: 'submitted', label: 'Submitted' },
    { key: 'under_review', label: 'Under Review' },
    { key: 'approved', label: 'Approved' },
    { key: 'fulfilled', label: 'Fulfilled' },
  ];

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.headerSection}>
        <div className={styles.headerContainer}>
          <div className={styles.headerRow}>
            <div className={styles.headerInfo}>
              <h1 className={styles.pageTitle}>MY ADVANCES</h1>
              <p className={styles.pageSubtitle}>
                Manage your production advance requests
              </p>
            </div>

            <button
              type="button"
              onClick={() => router.push('/advances/catalog')}
              className={styles.newButton}
            >
              <Plus className={styles.icon} />
              NEW ADVANCE
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className={styles.filterSection}>
        <div className={styles.content}>
          <div className={styles.filterTabs}>
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilter(tab.key)}
                className={cn(
                  styles.filterButton,
                  filter === tab.key
                    ? styles.filterButtonActive
                    : styles.filterButtonInactive
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Advances List */}
      <div className={styles.mainContainer}>
        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner} />
          </div>
        ) : advances.length === 0 ? (
          <div className={styles.emptyState}>
            <GeometricIcon name="clipboard" size="xl" className={styles.emptyIcon} />
            <p className={styles.emptyTitle}>
              {filter === 'all' ? 'No advances found' : `No ${filter} advances`}
            </p>
            <p className={styles.emptySubtitle}>
              Create your first production advance request
            </p>
            <button
              type="button"
              onClick={() => router.push('/advances/catalog')}
              className={styles.emptyButton}
            >
              CREATE ADVANCE
            </button>
          </div>
        ) : (
          <div className={styles.grid}>
            {advances.map((advance) => (
              <Link
                key={advance.id}
                href={`/advances/${advance.id}`}
                className={styles.advanceCard}
              >
                <div className={styles.card}>
                  {/* Header */}
                  <div className={styles.cardHeader}>
                    <div className={styles.cardHeaderInfo}>
                      <h3 className={styles.cardTitle}>
                        {advance.event_name}
                      </h3>
                      <p className={styles.cardMeta}>
                        {advance.advance_number} · {advance.company_name}
                      </p>
                    </div>
                    <StatusBadge status={advance.status} size="md" />
                  </div>

                  {/* Details Grid */}
                  <div className={styles.detailsGrid}>
                    <div className={styles.detailItem}>
                      <p className={styles.detailLabel}>
                        Service Period
                      </p>
                      <p className={styles.detailValue}>
                        {formatDate(advance.service_start_date)} -{' '}
                        {formatDate(advance.service_end_date)}
                      </p>
                      <p className={styles.detailHint}>
                        {advance.duration_days} days
                      </p>
                    </div>

                    <div className={styles.detailItem}>
                      <p className={styles.detailLabel}>
                        Items Requested
                      </p>
                      <p className={styles.detailValueLarge}>
                        {advance.total_items}
                      </p>
                    </div>

                    <div className={styles.detailItem}>
                      <p className={styles.detailLabel}>
                        {advance.status === 'draft' ? 'Created' : 'Submitted'}
                      </p>
                      <p className={styles.detailValue}>
                        {formatDateTime(advance.submitted_at || advance.created_at)}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className={styles.cardActions}>
                    <span className={styles.viewLink}>
                      VIEW DETAILS
                      <GeometricIcon name="arrow-right" size="sm" />
                    </span>

                    {advance.status === 'draft' && (
                      <span className={styles.draftBadge}>
                        DRAFT
                      </span>
                    )}

                    {advance.status === 'approved' && (
                      <span className={styles.readyBadge}>
                        READY FOR FULFILLMENT
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
