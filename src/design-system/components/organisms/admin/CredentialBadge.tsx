/**
 * Credential Badge Component
 * Printable badge layout for event credentials
 */

'use client';

import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import styles from './CredentialBadge.module.css';

interface CredentialBadgeProps {
  credential: {
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
  };
}

export function CredentialBadge({ credential }: CredentialBadgeProps) {
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (qrCanvasRef.current && credential.qr_code_data) {
      QRCode.toCanvas(
        qrCanvasRef.current,
        credential.qr_code_data,
        {
          width: 200,
          margin: 2,
          color: {
            dark: '#030712', // eslint-disable-line no-restricted-syntax -- QR codes require hardcoded colors for proper scanning
            light: '#FFFFFF', // eslint-disable-line no-restricted-syntax -- QR codes require hardcoded colors for proper scanning
          },
        },
        (error) => {
          if (error) console.error('QR Code generation error:', error);
        }
      );
    }
  }, [credential.qr_code_data]);

  const getBadgeColor = (color: string) => {
    const colors: Record<string, string> = {
      red: 'var(--color-red-500)',
      yellow: 'var(--color-yellow-500)',
      blue: 'var(--color-blue-500)',
      green: 'var(--color-green-500)',
      orange: 'var(--color-orange-500)',
      purple: 'var(--color-black)',
      white: 'var(--color-white)',
      gray: 'var(--color-grey-500)',
    };
    return colors[color] || 'var(--color-grey-500)';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className={styles.badgeContainer}>
      {/* Print Styles */}
      <style jsx>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .credential-badge-container,
          .credential-badge-container * {
            visibility: visible;
          }
          .credential-badge-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Badge - Standard 4" x 6" size */}
      <div className={styles.badge}>
        {/* Color Bar */}
        <div className={styles.colorBar} style={{ backgroundColor: getBadgeColor(credential.badge_color) }}>
          <div className={styles.colorBarText}>
            {credential.credential_type.toUpperCase()}
          </div>
        </div>

        {/* Content */}
        <div className={styles.content}>
          {/* Photo */}
          {credential.holder_photo_url && (
            <div className={styles.photoContainer}>
              <img
                src={credential.holder_photo_url}
                alt={credential.holder_name}
                className={styles.photo}
              />
            </div>
          )}

          {/* Holder Info */}
          <div className={styles.holderInfo}>
            <h2 className={styles.holderName}>
              {credential.holder_name}
            </h2>
            {credential.holder_company && (
              <p className={styles.holderCompany}>{credential.holder_company}</p>
            )}
            {credential.holder_role && (
              <p className={styles.holderRole}>{credential.holder_role}</p>
            )}
          </div>

          {/* Event Info */}
          <div className={styles.eventInfo}>
            <p className={styles.eventName}>{credential.event_name}</p>
            {credential.venue_name && (
              <p className={styles.venueName}>{credential.venue_name}</p>
            )}
          </div>

          {/* Validity */}
          <div className={styles.validity}>
            <p>Valid: {formatDate(credential.valid_from)}</p>
            {credential.valid_until && <p>Until: {formatDate(credential.valid_until)}</p>}
          </div>

          {/* QR Code */}
          <div className={styles.qrContainer}>
            <canvas ref={qrCanvasRef} className={styles.qrCanvas} />
            <p className={styles.credentialNumber}>{credential.credential_number}</p>
          </div>

          {/* Access Permissions (small print) */}
          <div className={styles.permissions}>
            {credential.access_permissions.backstage && '🎭 Backstage '}
            {credential.access_permissions.stage_access && '🎤 Stage '}
            {credential.access_permissions.vip_areas && '⭐ VIP '}
            {credential.access_permissions.production_areas && '🔧 Production '}
          </div>
        </div>
      </div>

      {/* Print Button (hidden when printing) */}
      <div className="no-print">
        <div className={styles.printButtonContainer}>
        <button
          onClick={() => window.print()}
          className={styles.printButton}
        >
          Print Badge
        </button>
        </div>
      </div>
    </div>
  );
}
