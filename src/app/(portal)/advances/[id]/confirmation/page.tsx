'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { GeometricIcon } from '@/design-system/components/atoms/GeometricIcon';
import { ProductionAdvance } from '@/lib/types/production-advances';
import { Check } from 'lucide-react';

export default function AdvanceConfirmationPage() {
  const router = useRouter();
  const params = useParams();
  const [advance, setAdvance] = useState<ProductionAdvance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdvance = async () => {
      if (!params.id) return;

      try {
        const response = await fetch(`/api/advances/${params.id}`);
        if (!response.ok) throw new Error('Failed to fetch advance');
        
        const data = await response.json();
        setAdvance(data.advance);
      } catch (error) {
        console.error('Error fetching advance:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdvance();
  }, [params.id]);

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

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-2xl text-center">
          {/* Success Animation */}
          <div className="mb-8 flex justify-center">
            <div className="flex h-24 w-24 items-center justify-center border-3 border-black bg-black">
              <Check className="h-12 w-12 text-white" />
            </div>
          </div>

          {/* Confirmation Message */}
          <h1 className="font-anton text-4xl uppercase">ADVANCE SUBMITTED</h1>
          <p className="mt-4 font-share-tech text-lg text-grey-700">
            Your production advance request has been successfully submitted and is now under review.
          </p>

          {/* Advance Number */}
          <div className="mt-8 border-3 border-black bg-grey-50 p-8">
            <p className="font-share-tech-mono text-xs uppercase text-grey-600">
              ADVANCE NUMBER
            </p>
            <p className="mt-2 font-bebas-neue text-3xl uppercase">
              {advance.advance_number}
            </p>
          </div>

          {/* What&apos;s Next */}
          <div className="mt-8 border-3 border-black bg-white p-8 text-left">
            <h2 className="mb-6 font-bebas-neue text-2xl uppercase">WHAT&apos;S NEXT?</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center border-3 border-black bg-black font-bebas-neue text-lg text-white">
                  1
                </div>
                <div>
                  <h3 className="font-bebas-neue text-lg uppercase">REVIEW</h3>
                  <p className="mt-1 font-share-tech text-sm text-grey-700">
                    Our team will review your request within 24 hours
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center border-3 border-black bg-black font-bebas-neue text-lg text-white">
                  2
                </div>
                <div>
                  <h3 className="font-bebas-neue text-lg uppercase">NOTIFICATION</h3>
                  <p className="mt-1 font-share-tech text-sm text-grey-700">
                    You&apos;ll receive email notifications on approval status
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center border-3 border-black bg-black font-bebas-neue text-lg text-white">
                  3
                </div>
                <div>
                  <h3 className="font-bebas-neue text-lg uppercase">TRACKING</h3>
                  <p className="mt-1 font-share-tech text-sm text-grey-700">
                    Track your advance in the &quot;My Advances&quot; section
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link
              href={`/advances/${advance.id}`}
              className="flex flex-1 items-center justify-center gap-2 border-3 border-black bg-white px-6 py-4 font-bebas-neue uppercase transition-colors hover:bg-grey-100"
            >
              VIEW ADVANCE
            </Link>
            <Link
              href="/advances/catalog"
              className="flex flex-1 items-center justify-center gap-2 border-3 border-black bg-black px-6 py-4 font-bebas-neue uppercase text-white transition-colors hover:bg-white hover:text-black"
            >
              CREATE ANOTHER ADVANCE
            </Link>
          </div>

          {/* Email Notice */}
          <p className="mt-8 font-share-tech-mono text-xs text-grey-600">
            A confirmation email has been sent to {advance.point_of_contact_email}
          </p>
        </div>
      </div>
    </div>
  );
}
