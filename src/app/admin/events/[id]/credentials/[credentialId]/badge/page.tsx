/**
 * Credential Badge Print Page
 * Displays printable badge for a credential
 */

'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { CredentialBadge } from '@/components/admin/CredentialBadge';

interface BadgeData {
  credential_number: string;
  credential_type: string;
  badge_color: string;
  holder_name: string;
  holder_company?: string;
  holder_role?: string;
  holder_photo_url?: string;
  event_name: string;
  venue_name?: string;
  valid_from: string;
  valid_until?: string;
  access_permissions: Record<string, any>;
  qr_code_data: string;
}

export default function CredentialBadgePage() {
  const params = useParams();
  const eventId = params.id as string;
  const credentialId = params.credentialId as string;

  const [badgeData, setBadgeData] = useState<BadgeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBadgeData();
  }, [eventId, credentialId]);

  const fetchBadgeData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/admin/events/${eventId}/credentials/${credentialId}/print`,
        { method: 'POST' }
      );

      const data = await response.json();

      if (response.ok) {
        setBadgeData(data.badge);
      } else {
        setError(data.error || 'Failed to load badge data');
      }
    } catch (err) {
      setError('Error loading badge data');
      console.error('Badge fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading badge...</p>
        </div>
      </div>
    );
  }

  if (error || !badgeData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Badge not found'}</p>
          <button
            onClick={() => window.close()}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <CredentialBadge credential={badgeData} />
    </div>
  );
}
