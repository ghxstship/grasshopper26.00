'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GeometricIcon } from '@/design-system/components/atoms/GeometricIcon';
import { StatusBadge, AdvanceStatus } from '@/design-system/components/atoms/StatusBadge';
import { ProductionAdvance } from '@/lib/types/production-advances';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';

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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b-3 border-black bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-anton text-4xl uppercase">MY ADVANCES</h1>
              <p className="mt-2 font-share-tech text-grey-700">
                Manage your production advance requests
              </p>
            </div>

            <button
              type="button"
              onClick={() => router.push('/advances/catalog')}
              className="flex items-center justify-center gap-2 border-3 border-black bg-black px-6 py-4 font-bebas-neue uppercase text-white transition-colors hover:bg-white hover:text-black"
            >
              <Plus className="h-5 w-5" />
              NEW ADVANCE
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="border-b-2 border-grey-200 bg-grey-50">
        <div className="container mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto py-4">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilter(tab.key)}
                className={cn(
                  'shrink-0 border-3 px-4 py-2 font-bebas-neue text-sm uppercase transition-colors',
                  filter === tab.key
                    ? 'border-black bg-black text-white'
                    : 'border-black bg-white text-black hover:bg-grey-100'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Advances List */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-12 w-12 animate-spin border-4 border-black border-t-transparent" />
          </div>
        ) : advances.length === 0 ? (
          <div className="flex flex-col items-center justify-center border-3 border-grey-300 bg-grey-50 py-20 text-center">
            <GeometricIcon name="clipboard" size="xl" className="mb-4 text-grey-400" />
            <p className="mb-2 font-share-tech text-grey-700">
              {filter === 'all' ? 'No advances found' : `No ${filter} advances`}
            </p>
            <p className="mb-6 font-share-tech-mono text-sm text-grey-600">
              Create your first production advance request
            </p>
            <button
              type="button"
              onClick={() => router.push('/advances/catalog')}
              className="border-3 border-black bg-white px-6 py-3 font-bebas-neue uppercase transition-colors hover:bg-black hover:text-white"
            >
              CREATE ADVANCE
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {advances.map((advance) => (
              <Link
                key={advance.id}
                href={`/advances/${advance.id}`}
                className="block border-3 border-black bg-white transition-all hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex flex-col gap-4 border-b-2 border-grey-200 pb-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1">
                      <h3 className="font-bebas-neue text-2xl uppercase">
                        {advance.event_name}
                      </h3>
                      <p className="mt-1 font-share-tech-mono text-sm text-grey-600">
                        {advance.advance_number} · {advance.company_name}
                      </p>
                    </div>
                    <StatusBadge status={advance.status} size="md" />
                  </div>

                  {/* Details Grid */}
                  <div className="mt-4 grid gap-4 sm:grid-cols-3">
                    <div>
                      <p className="font-share-tech-mono text-xs uppercase text-grey-600">
                        Service Period
                      </p>
                      <p className="mt-1 font-share-tech text-sm">
                        {formatDate(advance.service_start_date)} -{' '}
                        {formatDate(advance.service_end_date)}
                      </p>
                      <p className="mt-0.5 font-share-tech-mono text-xs text-grey-600">
                        {advance.duration_days} days
                      </p>
                    </div>

                    <div>
                      <p className="font-share-tech-mono text-xs uppercase text-grey-600">
                        Items Requested
                      </p>
                      <p className="mt-1 font-bebas-neue text-xl">
                        {advance.total_items}
                      </p>
                    </div>

                    <div>
                      <p className="font-share-tech-mono text-xs uppercase text-grey-600">
                        {advance.status === 'draft' ? 'Created' : 'Submitted'}
                      </p>
                      <p className="mt-1 font-share-tech text-sm">
                        {formatDateTime(advance.submitted_at || advance.created_at)}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex flex-wrap gap-2 border-t-2 border-grey-200 pt-4">
                    <span className="flex items-center gap-2 font-bebas-neue text-sm uppercase text-grey-700">
                      VIEW DETAILS
                      <GeometricIcon name="arrow-right" size="sm" />
                    </span>

                    {advance.status === 'draft' && (
                      <span className="ml-auto border-2 border-black bg-black px-3 py-1 font-bebas-neue text-xs uppercase text-white">
                        DRAFT
                      </span>
                    )}

                    {advance.status === 'approved' && (
                      <span className="ml-auto border-2 border-black bg-white px-3 py-1 font-bebas-neue text-xs uppercase text-black">
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
