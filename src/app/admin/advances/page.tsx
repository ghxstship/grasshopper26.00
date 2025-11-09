'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GeometricIcon } from '@/design-system/components/atoms/GeometricIcon';
import { StatusBadge, AdvanceStatus } from '@/design-system/components/atoms/StatusBadge';
import { ProductionAdvance } from '@/lib/types/production-advances';
import { cn } from '@/lib/utils';
import { Search, Filter as FilterIcon } from 'lucide-react';

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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b-3 border-black bg-white">
        <div className="container mx-auto px-4 py-8">
          <h1 className="font-anton text-4xl uppercase">PRODUCTION ADVANCES</h1>
          <p className="mt-2 font-share-tech text-grey-700">
            Manage and review production advance requests
          </p>

          {/* Stats */}
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="border-3 border-black bg-grey-50 p-4">
              <p className="font-share-tech-mono text-xs uppercase text-grey-600">
                Pending Review
              </p>
              <p className="mt-2 font-bebas-neue text-3xl">{stats.pending}</p>
            </div>
            <div className="border-3 border-black bg-grey-50 p-4">
              <p className="font-share-tech-mono text-xs uppercase text-grey-600">
                Under Review
              </p>
              <p className="mt-2 font-bebas-neue text-3xl">{stats.underReview}</p>
            </div>
            <div className="border-3 border-black bg-grey-50 p-4">
              <p className="font-share-tech-mono text-xs uppercase text-grey-600">
                Awaiting Fulfillment
              </p>
              <p className="mt-2 font-bebas-neue text-3xl">{stats.approved}</p>
            </div>
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

      {/* Search & Filters */}
      <div className="border-b-2 border-grey-200 bg-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-grey-400" />
              <input
                type="text"
                placeholder="Search by advance number, event, company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchAdvances()}
                className="w-full border-3 border-black bg-white py-3 pl-12 pr-4 font-share-tech outline-none focus:border-grey-800"
              />
            </div>
            <button
              type="button"
              onClick={fetchAdvances}
              className="flex items-center gap-2 border-3 border-black bg-black px-6 py-3 font-bebas-neue uppercase text-white transition-colors hover:bg-white hover:text-black"
            >
              <Search className="h-5 w-5" />
              SEARCH
            </button>
          </div>
        </div>
      </div>

      {/* Advances Table */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-12 w-12 animate-spin border-4 border-black border-t-transparent" />
          </div>
        ) : advances.length === 0 ? (
          <div className="flex flex-col items-center justify-center border-3 border-grey-300 bg-grey-50 py-20 text-center">
            <GeometricIcon name="clipboard" size="xl" className="mb-4 text-grey-400" />
            <p className="mb-2 font-share-tech text-grey-700">
              No advances found
            </p>
            <p className="font-share-tech-mono text-sm text-grey-600">
              {filter === 'all' ? 'No advances in the system' : `No ${filter} advances`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-3 border-black">
              <thead>
                <tr className="border-b-3 border-black bg-grey-50">
                  <th className="border-r-2 border-grey-300 px-4 py-3 text-left font-bebas-neue text-sm uppercase">
                    Advance #
                  </th>
                  <th className="border-r-2 border-grey-300 px-4 py-3 text-left font-bebas-neue text-sm uppercase">
                    Event
                  </th>
                  <th className="border-r-2 border-grey-300 px-4 py-3 text-left font-bebas-neue text-sm uppercase">
                    Company
                  </th>
                  <th className="border-r-2 border-grey-300 px-4 py-3 text-left font-bebas-neue text-sm uppercase">
                    Service Dates
                  </th>
                  <th className="border-r-2 border-grey-300 px-4 py-3 text-left font-bebas-neue text-sm uppercase">
                    Items
                  </th>
                  <th className="border-r-2 border-grey-300 px-4 py-3 text-left font-bebas-neue text-sm uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left font-bebas-neue text-sm uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {advances.map((advance) => (
                  <tr
                    key={advance.id}
                    className={cn(
                      'border-b-2 border-grey-200 transition-colors hover:bg-grey-50',
                      isUrgent(advance) && 'bg-yellow-50'
                    )}
                  >
                    <td className="border-r-2 border-grey-200 px-4 py-4">
                      <Link
                        href={`/admin/advances/${advance.id}`}
                        className="font-share-tech-mono text-sm hover:underline"
                      >
                        {advance.advance_number}
                      </Link>
                      {isUrgent(advance) && (
                        <span className="ml-2 inline-flex items-center gap-1 border-2 border-black bg-yellow-300 px-2 py-0.5 font-bebas-neue text-xs uppercase">
                          <GeometricIcon name="alert" size="xs" />
                          URGENT
                        </span>
                      )}
                    </td>
                    <td className="border-r-2 border-grey-200 px-4 py-4">
                      <p className="font-share-tech text-sm">{advance.event_name}</p>
                    </td>
                    <td className="border-r-2 border-grey-200 px-4 py-4">
                      <p className="font-share-tech text-sm">{advance.company_name}</p>
                      <p className="font-share-tech-mono text-xs text-grey-600">
                        {advance.point_of_contact_name}
                      </p>
                    </td>
                    <td className="border-r-2 border-grey-200 px-4 py-4">
                      <p className="font-share-tech text-sm">
                        {formatDate(advance.service_start_date)} - {formatDate(advance.service_end_date)}
                      </p>
                      <p className="font-share-tech-mono text-xs text-grey-600">
                        {advance.duration_days} days
                      </p>
                    </td>
                    <td className="border-r-2 border-grey-200 px-4 py-4 text-center">
                      <p className="font-bebas-neue text-xl">{advance.total_items}</p>
                    </td>
                    <td className="border-r-2 border-grey-200 px-4 py-4">
                      <StatusBadge status={advance.status} size="sm" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <Link
                          href={`/admin/advances/${advance.id}`}
                          className="flex items-center gap-1 border-2 border-black bg-white px-3 py-1 font-bebas-neue text-xs uppercase transition-colors hover:bg-black hover:text-white"
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
      </div>
    </div>
  );
}
