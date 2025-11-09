'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MessageSquare, Download } from 'lucide-react';
import { GeometricIcon } from '@/design-system/components/atoms/GeometricIcon';
import { StatusBadge } from '@/design-system/components/atoms/StatusBadge';
import { ProductionAdvance, ProductionAdvanceComment } from '@/lib/types/production-advances';
import { cn } from '@/lib/utils';

export default function AdvanceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [advance, setAdvance] = useState<ProductionAdvance | null>(null);
  const [comments, setComments] = useState<ProductionAdvanceComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    const fetchAdvanceDetail = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/advances/${params.id}`);
        if (!response.ok) throw new Error('Failed to fetch advance');
        
        const data = await response.json();
        setAdvance(data.advance);
        setComments(data.advance.comments || []);
      } catch (error) {
        console.error('Error fetching advance:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchAdvanceDetail();
    }
  }, [params.id]);

  const handlePostComment = async () => {
    if (!newComment.trim() || !advance) return;

    setSubmittingComment(true);
    try {
      const response = await fetch(`/api/advances/${advance.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment_text: newComment }),
      });

      if (!response.ok) throw new Error('Failed to post comment');

      const data = await response.json();
      setComments([...comments, data.comment]);
      setNewComment('');
    } catch (error) {
      console.error('Error posting comment:', error);
      alert('Failed to post comment');
    } finally {
      setSubmittingComment(false);
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

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateString);
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
          onClick={() => router.push('/advances')}
          className="mt-4 border-3 border-black bg-white px-6 py-3 font-bebas-neue uppercase transition-colors hover:bg-black hover:text-white"
        >
          BACK TO MY ADVANCES
        </button>
      </div>
    );
  }

  const timelineSteps = [
    {
      label: 'Submitted',
      status: 'submitted',
      timestamp: advance.submitted_at,
      completed: true,
    },
    {
      label: 'Under Review',
      status: 'under_review',
      timestamp: null,
      completed: ['under_review', 'approved', 'rejected', 'fulfilled'].includes(advance.status),
      active: advance.status === 'under_review',
    },
    {
      label: advance.status === 'rejected' ? 'Rejected' : 'Approved',
      status: advance.status === 'rejected' ? 'rejected' : 'approved',
      timestamp: advance.approved_at,
      completed: ['approved', 'fulfilled'].includes(advance.status) || advance.status === 'rejected',
      active: advance.status === 'approved' || advance.status === 'rejected',
    },
    {
      label: 'Fulfilled',
      status: 'fulfilled',
      timestamp: null,
      completed: advance.status === 'fulfilled',
      active: advance.status === 'fulfilled',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b-3 border-black bg-white">
        <div className="container mx-auto px-4 py-6">
          <Link
            href="/advances"
            className="mb-4 inline-flex items-center gap-2 font-bebas-neue uppercase transition-colors hover:text-grey-600"
          >
            <ArrowLeft className="h-5 w-5" />
            BACK TO MY ADVANCES
          </Link>

          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="font-anton text-3xl uppercase">{advance.event_name}</h1>
              <p className="mt-2 font-share-tech-mono text-sm text-grey-600">
                {advance.advance_number}
              </p>
            </div>
            <StatusBadge status={advance.status} size="lg" />
          </div>
        </div>
      </div>

      {/* Status Timeline */}
      {advance.status !== 'draft' && (
        <div className="border-b-2 border-grey-200 bg-grey-50">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between">
              {timelineSteps.map((step, index) => (
                <React.Fragment key={step.status}>
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        'flex h-12 w-12 items-center justify-center border-3 font-bebas-neue text-lg',
                        step.completed
                          ? 'border-black bg-black text-white'
                          : step.active
                          ? 'border-black bg-white text-black'
                          : 'border-grey-400 bg-grey-200 text-grey-600'
                      )}
                    >
                      {step.completed ? (
                        <GeometricIcon name="check" size="md" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <p
                      className={cn(
                        'mt-2 text-center font-bebas-neue text-sm uppercase',
                        step.completed || step.active ? 'text-black' : 'text-grey-600'
                      )}
                    >
                      {step.label}
                    </p>
                    {step.timestamp && (
                      <p className="mt-1 text-center font-share-tech-mono text-xs text-grey-600">
                        {formatDateTime(step.timestamp)}
                      </p>
                    )}
                  </div>
                  {index < timelineSteps.length - 1 && (
                    <div
                      className={cn(
                        'h-0.5 flex-1',
                        step.completed ? 'bg-black' : 'bg-grey-300'
                      )}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
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
                    <dd className="mt-1 font-share-tech text-sm">{advance.point_of_contact_email}</dd>
                  </div>
                  {advance.point_of_contact_phone && (
                    <div>
                      <dt className="font-share-tech-mono text-xs uppercase text-grey-600">Phone</dt>
                      <dd className="mt-1 font-share-tech text-sm">{advance.point_of_contact_phone}</dd>
                    </div>
                  )}
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
                  <h2 className="mb-6 font-bebas-neue text-2xl uppercase">NOTES</h2>
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

                        {item.fulfillment_status && (
                          <div className="mt-2">
                            <StatusBadge status={item.fulfillment_status} size="sm" />
                          </div>
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

              {/* Rejection Notice */}
              {advance.status === 'rejected' && advance.rejection_reason && (
                <div className="border-3 border-black bg-white p-6">
                  <h2 className="mb-4 font-bebas-neue text-2xl uppercase text-black">REJECTION REASON</h2>
                  <p className="font-share-tech text-sm">{advance.rejection_reason}</p>
                </div>
              )}

              {/* Comments */}
              <div className="border-3 border-black bg-white p-6">
                <h2 className="mb-6 font-bebas-neue text-2xl uppercase">COMMUNICATION</h2>

                {comments.length === 0 ? (
                  <p className="py-8 text-center font-share-tech text-sm text-grey-600">
                    No comments yet
                  </p>
                ) : (
                  <div className="mb-6 space-y-4">
                    {comments.map((comment) => (
                      <div key={comment.id} className="border-b-2 border-grey-200 pb-4 last:border-0 last:pb-0">
                        <div className="flex items-start justify-between">
                          <p className="font-share-tech-mono text-xs uppercase text-grey-600">
                            User {comment.user_id?.substring(0, 8)}
                          </p>
                          <p className="font-share-tech-mono text-xs text-grey-600">
                            {formatRelativeTime(comment.created_at)}
                          </p>
                        </div>
                        <p className="mt-2 font-share-tech text-sm">{comment.comment_text}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Comment */}
                <div className="space-y-3">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment or question..."
                    rows={3}
                    className="w-full border-3 border-black bg-white px-4 py-3 font-share-tech text-sm outline-none focus:border-grey-800"
                  />
                  <button
                    type="button"
                    onClick={handlePostComment}
                    disabled={!newComment.trim() || submittingComment}
                    className="flex items-center gap-2 border-3 border-black bg-black px-6 py-3 font-bebas-neue uppercase text-white transition-colors hover:bg-white hover:text-black disabled:opacity-50"
                  >
                    <MessageSquare className="h-4 w-4" />
                    {submittingComment ? 'POSTING...' : 'POST COMMENT'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <div className="border-3 border-black bg-white p-6">
              <h2 className="mb-4 font-bebas-neue text-xl uppercase">ACTIONS</h2>
              <div className="space-y-3">
                {advance.status === 'draft' && (
                  <>
                    <button
                      type="button"
                      onClick={() => router.push(`/advances/${advance.id}/edit`)}
                      className="flex w-full items-center justify-center gap-2 border-3 border-black bg-white px-4 py-3 font-bebas-neue uppercase transition-colors hover:bg-black hover:text-white"
                    >
                      <GeometricIcon name="edit" size="sm" />
                      EDIT ADVANCE
                    </button>
                    <button
                      type="button"
                      className="flex w-full items-center justify-center gap-2 border-3 border-black bg-black px-4 py-3 font-bebas-neue uppercase text-white transition-colors hover:bg-white hover:text-black"
                    >
                      SUBMIT FOR REVIEW
                    </button>
                  </>
                )}

                {advance.status === 'approved' && (
                  <button
                    type="button"
                    className="flex w-full items-center justify-center gap-2 border-3 border-black bg-white px-4 py-3 font-bebas-neue uppercase transition-colors hover:bg-black hover:text-white"
                  >
                    <GeometricIcon name="copy" size="sm" />
                    DUPLICATE ADVANCE
                  </button>
                )}

                <button
                  type="button"
                  className="flex w-full items-center justify-center gap-2 border-3 border-black bg-white px-4 py-3 font-bebas-neue uppercase transition-colors hover:bg-black hover:text-white"
                >
                  <Download className="h-4 w-4" />
                  DOWNLOAD PDF
                </button>
              </div>
            </div>

            {/* Quick Info */}
            <div className="border-3 border-black bg-grey-50 p-6">
              <h2 className="mb-4 font-bebas-neue text-xl uppercase">QUICK INFO</h2>
              <dl className="space-y-3">
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
                {advance.approved_at && (
                  <div>
                    <dt className="font-share-tech-mono text-xs uppercase text-grey-600">
                      {advance.status === 'rejected' ? 'Reviewed' : 'Approved'}
                    </dt>
                    <dd className="mt-1 font-share-tech text-sm">{formatDateTime(advance.approved_at)}</dd>
                  </div>
                )}
                <div>
                  <dt className="font-share-tech-mono text-xs uppercase text-grey-600">Last Updated</dt>
                  <dd className="mt-1 font-share-tech text-sm">{formatDateTime(advance.updated_at)}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
