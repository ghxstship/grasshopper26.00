'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { GeometricShape } from '@/design-system/components/atoms/GeometricShape';
import { ProductionAdvance } from '@/lib/types/production-advances';
import { Check } from 'lucide-react';
import styles from './page.module.css';

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
      <div className={styles.row}>
        <div className={styles.spinner} />
      </div>
    );
  }

  if (!advance) {
    return (
      <div className={styles.row}>
        <GeometricShape name="alert" size="xl" className={styles.errorIcon} />
        <p className={styles.errorText}>Advance not found</p>
        <button
          type="button"
          onClick={() => router.push('/portal/advances')}
          className={styles.errorButton}
        >
          BACK TO MY ADVANCES
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.centerBox}>
          {/* Success Animation */}
          <div className={styles.successIcon}>
            <div className={styles.successCircle}>
              <Check className={styles.checkIcon} />
            </div>
          </div>

          {/* Confirmation Message */}
          <h1 className={styles.heading}>ADVANCE SUBMITTED</h1>
          <p className={styles.description}>
            Your production advance request has been successfully submitted and is now under review.
          </p>

          {/* Advance Number */}
          <div className={styles.advanceBox}>
            <p className={styles.advanceLabel}>
              ADVANCE NUMBER
            </p>
            <p className={styles.advanceNumber}>
              {advance.advance_number}
            </p>
          </div>

          {/* What&apos;s Next */}
          <div className={styles.nextBox}>
            <h2 className={styles.nextTitle}>WHAT&apos;S NEXT?</h2>
            <div className={styles.section}>
              <div className={styles.step}>
                <div className={styles.stepNumber}>
                  1
                </div>
                <div className={styles.stepContent}>
                  <h3 className={styles.stepTitle}>REVIEW</h3>
                  <p className={styles.stepText}>
                    Our team will review your request within 24 hours
                  </p>
                </div>
              </div>

              <div className={styles.step}>
                <div className={styles.stepNumber}>
                  2
                </div>
                <div className={styles.stepContent}>
                  <h3 className={styles.stepTitle}>NOTIFICATION</h3>
                  <p className={styles.stepText}>
                    You&apos;ll receive email notifications on approval status
                  </p>
                </div>
              </div>

              <div className={styles.step}>
                <div className={styles.stepNumber}>
                  3
                </div>
                <div className={styles.stepContent}>
                  <h3 className={styles.stepTitle}>TRACKING</h3>
                  <p className={styles.stepText}>
                    Track your advance in the &quot;My Advances&quot; section
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className={styles.actions}>
            <Link
              href={`/advances/${advance.id}`}
              className={styles.actionButton}
            >
              VIEW ADVANCE
            </Link>
            <Link
              href="/advances/catalog"
              className={styles.actionButtonSecondary}
            >
              CREATE ANOTHER ADVANCE
            </Link>
          </div>

          {/* Email Notice */}
          <p className={styles.emailNotice}>
            A confirmation email has been sent to {advance.point_of_contact_email}
          </p>
        </div>
      </div>
    </div>
  );
}
