'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Check, X } from 'lucide-react';
import { GeometricIcon } from '@/design-system/components/atoms/GeometricIcon';
import { StatusBadge } from '@/design-system/components/atoms/StatusBadge';
import { ProductionAdvance } from '@/lib/types/production-advances';
import { cn } from '@/lib/utils';

export default function AdminAdvanceReviewPage() {
  const router = useRouter();
  const params = useParams();
  const [advance, setAdvance] = useState<ProductionAdvance | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [decision, setDecision] = useState<'approved' | 'rejected' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [internalNotes, setInternalNotes] = useState('');

  useEffect(() => {
    const fetchAdvance = async () => {
      if (!params.id) return;

      setLoading(true);
      try {
        const response = await fetch(`/api/advances/${params.id}`);
        if (!response.ok) throw new Error('Failed to fetch advance');
        
        const data = await response.json();
        setAdvance(data.advance);
        setInternalNotes(data.advance.internal_notes || '');
      } catch (error) {
        console.error('Error fetching advance:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdvance();
  }, [params.id]);

  const handleApprove = async () => {
    if (!advance) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/admin/advances/${advance.id}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision: 'approved',
          internal_notes: internalNotes,
        }),
      });

      if (!response.ok) throw new Error('Failed to approve advance');

      alert('Advance approved successfully');
      router.push('/admin/advances');
    } catch (error) {
      console.error('Error approving advance:', error);
      alert('Failed to approve advance');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!advance || !rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/admin/advances/${advance.id}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision: 'rejected',
          rejection_reason: rejectionReason,
          internal_notes: internalNotes,
        }),
      });

      if (!response.ok) throw new Error('Failed to reject advance');

      alert('Advance rejected');
      router.push('/admin/advances');
    } catch (error) {
      console.error('Error rejecting advance:', error);
      alert('Failed to reject advance');
    } finally {
      setSubmitting(false);
    }
  };

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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin border-4 border-black border-t-transparent" />
      </div>
    );
  }

  if (!advance) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <GeometricIcon name="alert" size="xl" className="mb-4 text-grey-400" />
        <p className="font-share-tech text-grey-700">Advance not found</p>
        <button
          type="button"
          onClick={() => router.push('/admin/advances')}
          className="mt-4 border-3 border-black bg-white px-6 py-3 font-bebas-neue uppercase transition-colors hover:bg-black hover:text-white"
        >
          BACK TO QUEUE
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b-3 border-black bg-white">
        <div className="container mx-auto px-4 py-6">
          <Link
            href="/admin/advances"
            className="mb-4 inline-flex items-center gap-2 font-bebas-neue uppercase transition-colors hover:text-grey-600"
          >
            <ArrowLeft className="h-5 w-5" />
            BACK TO QUEUE
          </Link>

          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="font-anton text-3xl uppercase">{advance.advance_number}</h1>
              <p className="mt-2 font-share-tech text-grey-700">
                {advance.event_name} · {advance.company_name}
              </p>
            </div>
            <StatusBadge status={advance.status} size="lg" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content - Request Details */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {/* Request Information */}
              <div className="border-3 border-black bg-white p-6">
                <h2 className="mb-6 font-bebas-neue text-2xl uppercase">REQUEST INFORMATION</h2>
                <dl className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="font-share-tech-mono text-xs uppercase text-grey-600">Event</dt>
                    <dd className="mt-1 font-share-tech text-sm">{advance.event_name}</dd>
                  </div>
                  <div>
                    <dt className="font-share-tech-mono text-xs uppercase text-grey-600">Company</dt>
                    <dd className="mt-1 font-share-tech text-sm">{advance.company_name}</dd>
                  </div>
                  <div>
                    <dt className="font-share-tech-mono text-xs uppercase text-grey-600">Contact</dt>
                    <dd className="mt-1 font-share-tech text-sm">{advance.point_of_contact_name}</dd>
                  </div>
                  <div>
                    <dt className="font-share-tech-mono text-xs uppercase text-grey-600">Email</dt>
                    <dd className="mt-1 font-share-tech text-sm">
                      <a href={`mailto:${advance.point_of_contact_email}`} className="hover:underline">
                        {advance.point_of_contact_email}
                      </a>
                    </dd>
                  </div>
                  {advance.point_of_contact_phone && (
                    <div>
                      <dt className="font-share-tech-mono text-xs uppercase text-grey-600">Phone</dt>
                      <dd className="mt-1 font-share-tech text-sm">
                        <a href={`tel:${advance.point_of_contact_phone}`} className="hover:underline">
                          {advance.point_of_contact_phone}
                        </a>
                      </dd>
                    </div>
                  )}
                  <div>
                    <dt className="font-share-tech-mono text-xs uppercase text-grey-600">Submitted</dt>
                    <dd className="mt-1 font-share-tech text-sm">{formatDateTime(advance.submitted_at || advance.created_at)}</dd>
                  </div>
                </dl>
              </div>

              {/* Service Period */}
              <div className="border-3 border-black bg-white p-6">
                <h2 className="mb-6 font-bebas-neue text-2xl uppercase">SERVICE PERIOD</h2>
                <dl className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <dt className="font-share-tech-mono text-xs uppercase text-grey-600">Start Date</dt>
                    <dd className="mt-1 font-share-tech text-sm">{formatDate(advance.service_start_date)}</dd>
                  </div>
                  <div>
                    <dt className="font-share-tech-mono text-xs uppercase text-grey-600">End Date</dt>
                    <dd className="mt-1 font-share-tech text-sm">{formatDate(advance.service_end_date)}</dd>
                  </div>
                  <div>
                    <dt className="font-share-tech-mono text-xs uppercase text-grey-600">Duration</dt>
                    <dd className="mt-1 font-share-tech text-sm">{advance.duration_days} days</dd>
                  </div>
                </dl>
              </div>

              {/* Notes */}
              {(advance.purpose || advance.special_considerations || advance.additional_notes) && (
                <div className="border-3 border-black bg-white p-6">
                  <h2 className="mb-6 font-bebas-neue text-2xl uppercase">CLIENT NOTES</h2>
                  <div className="space-y-4">
                    {advance.purpose && (
                      <div>
                        <h3 className="font-share-tech-mono text-xs uppercase text-grey-600">Purpose</h3>
                        <p className="mt-2 font-share-tech text-sm">{advance.purpose}</p>
                      </div>
                    )}
                    {advance.special_considerations && (
                      <div>
                        <h3 className="font-share-tech-mono text-xs uppercase text-grey-600">Special Considerations</h3>
                        <p className="mt-2 font-share-tech text-sm">{advance.special_considerations}</p>
                      </div>
                    )}
                    {advance.additional_notes && (
                      <div>
                        <h3 className="font-share-tech-mono text-xs uppercase text-grey-600">Additional Notes</h3>
                        <p className="mt-2 font-share-tech text-sm">{advance.additional_notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Requested Items */}
              <div className="border-3 border-black bg-white p-6">
                <h2 className="mb-6 font-bebas-neue text-2xl uppercase">REQUESTED ITEMS</h2>
                <div className="space-y-4">
                  {advance.items?.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-4 border-b-2 border-grey-200 pb-4 last:border-0 last:pb-0"
                    >
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bebas-neue text-lg uppercase">{item.item_name}</h3>
                            {item.make && item.model && (
                              <p className="mt-1 font-share-tech-mono text-xs text-grey-600">
                                {item.make} {item.model}
                              </p>
                            )}
                          </div>
                          <span className="font-bebas-neue text-lg">Qty: {item.quantity}</span>
                        </div>

                        {item.modifiers && Object.keys(item.modifiers).length > 0 && (
                          <div className="mt-2">
                            <p className="font-share-tech text-xs text-grey-600">
                              {Object.entries(item.modifiers).map(([key, value]) => `+ ${value}`).join(', ')}
                            </p>
                          </div>
                        )}

                        {item.item_notes && (
                          <p className="mt-2 font-share-tech text-xs italic text-grey-600">
                            {item.item_notes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 border-t-2 border-grey-200 pt-4">
                  <p className="font-share-tech-mono text-xs uppercase text-grey-600">
                    TOTAL ITEMS: {advance.total_items}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Admin Controls */}
          <div className="space-y-6">
            {/* Approval Actions */}
            {advance.status === 'submitted' || advance.status === 'under_review' ? (
              <div className="border-3 border-black bg-white p-6">
                <h2 className="mb-4 font-bebas-neue text-xl uppercase">APPROVAL</h2>

                {!decision ? (
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => setDecision('approved')}
                      className="flex w-full items-center justify-center gap-2 border-3 border-black bg-black px-4 py-3 font-bebas-neue uppercase text-white transition-colors hover:bg-white hover:text-black"
                    >
                      <Check className="h-5 w-5" />
                      APPROVE
                    </button>
                    <button
                      type="button"
                      onClick={() => setDecision('rejected')}
                      className="flex w-full items-center justify-center gap-2 border-3 border-black bg-white px-4 py-3 font-bebas-neue uppercase transition-colors hover:bg-black hover:text-white"
                    >
                      <X className="h-5 w-5" />
                      REJECT
                    </button>
                  </div>
                ) : decision === 'approved' ? (
                  <div className="space-y-4">
                    <div className="border-2 border-black bg-grey-50 p-4">
                      <p className="font-bebas-neue uppercase">Approve this advance?</p>
                      <p className="mt-2 font-share-tech text-sm text-grey-700">
                        The client will be notified via email.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setDecision(null)}
                        className="flex-1 border-3 border-black bg-white px-4 py-3 font-bebas-neue uppercase transition-colors hover:bg-grey-100"
                      >
                        CANCEL
                      </button>
                      <button
                        type="button"
                        onClick={handleApprove}
                        disabled={submitting}
                        className="flex-1 border-3 border-black bg-black px-4 py-3 font-bebas-neue uppercase text-white transition-colors hover:bg-white hover:text-black disabled:opacity-50"
                      >
                        {submitting ? 'APPROVING...' : 'CONFIRM'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="rejection_reason" className="mb-2 block font-share-tech-mono text-xs uppercase">
                        Rejection Reason *
                      </label>
                      <textarea
                        id="rejection_reason"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Explain why this advance is being rejected..."
                        rows={4}
                        className="w-full border-3 border-black bg-white px-4 py-3 font-share-tech text-sm outline-none focus:border-grey-800"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setDecision(null)}
                        className="flex-1 border-3 border-black bg-white px-4 py-3 font-bebas-neue uppercase transition-colors hover:bg-grey-100"
                      >
                        CANCEL
                      </button>
                      <button
                        type="button"
                        onClick={handleReject}
                        disabled={submitting || !rejectionReason.trim()}
                        className="flex-1 border-3 border-black bg-black px-4 py-3 font-bebas-neue uppercase text-white transition-colors hover:bg-white hover:text-black disabled:opacity-50"
                      >
                        {submitting ? 'REJECTING...' : 'CONFIRM'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="border-3 border-black bg-grey-50 p-6">
                <h2 className="mb-4 font-bebas-neue text-xl uppercase">STATUS</h2>
                <p className="font-share-tech text-sm text-grey-700">
                  This advance has been {advance.status}.
                </p>
                {advance.approved_at && (
                  <p className="mt-2 font-share-tech-mono text-xs text-grey-600">
                    {formatDateTime(advance.approved_at)}
                  </p>
                )}
              </div>
            )}

            {/* Internal Notes */}
            <div className="border-3 border-black bg-white p-6">
              <h2 className="mb-4 font-bebas-neue text-xl uppercase">INTERNAL NOTES</h2>
              <textarea
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                placeholder="Internal notes (not visible to client)..."
                rows={6}
                className="w-full border-3 border-black bg-white px-4 py-3 font-share-tech text-sm outline-none focus:border-grey-800"
              />
              <p className="mt-2 font-share-tech-mono text-xs text-grey-600">
                These notes are only visible to admin users
              </p>
            </div>

            {/* Quick Info */}
            <div className="border-3 border-black bg-grey-50 p-6">
              <h2 className="mb-4 font-bebas-neue text-xl uppercase">QUICK INFO</h2>
              <dl className="space-y-3">
                <div>
                  <dt className="font-share-tech-mono text-xs uppercase text-grey-600">Submitter</dt>
                  <dd className="mt-1 font-share-tech text-sm">
                    User {advance.submitter_user_id.substring(0, 8)}
                  </dd>
                </div>
                <div>
                  <dt className="font-share-tech-mono text-xs uppercase text-grey-600">Created</dt>
                  <dd className="mt-1 font-share-tech text-sm">{formatDateTime(advance.created_at)}</dd>
                </div>
                {advance.submitted_at && (
                  <div>
                    <dt className="font-share-tech-mono text-xs uppercase text-grey-600">Submitted</dt>
                    <dd className="mt-1 font-share-tech text-sm">{formatDateTime(advance.submitted_at)}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
