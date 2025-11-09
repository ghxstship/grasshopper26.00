/**
 * Credential Badge Component
 * Printable badge layout for event credentials
 */

'use client';

import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

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
            dark: '#000000',
            light: '#FFFFFF',
          },
        },
        (error) => {
          if (error) console.error('QR Code generation error:', error);
        }
      );
    }
  }, [credential.qr_code_data]);

  const getBadgeColorStyle = (color: string) => {
    const colors: Record<string, string> = {
      red: 'bg-red-600',
      yellow: 'bg-yellow-400',
      blue: 'bg-blue-600',
      green: 'bg-green-600',
      orange: 'bg-orange-500',
      purple: 'bg-purple-600',
      white: 'bg-white border-2 border-gray-300',
      gray: 'bg-gray-400',
    };
    return colors[color] || 'bg-gray-400';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="credential-badge-container print:p-0">
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
      <div className="w-[4in] h-[6in] bg-white border-4 border-gray-800 rounded-lg overflow-hidden shadow-2xl mx-auto">
        {/* Color Bar */}
        <div className={`h-16 ${getBadgeColorStyle(credential.badge_color)} flex items-center justify-center`}>
          <div className="text-white font-bold text-2xl tracking-wider">
            {credential.credential_type.toUpperCase()}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col h-[calc(6in-4rem)]">
          {/* Photo */}
          {credential.holder_photo_url && (
            <div className="flex justify-center mb-4">
              <img
                src={credential.holder_photo_url}
                alt={credential.holder_name}
                className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
              />
            </div>
          )}

          {/* Holder Info */}
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              {credential.holder_name}
            </h2>
            {credential.holder_company && (
              <p className="text-lg text-gray-600 mb-1">{credential.holder_company}</p>
            )}
            {credential.holder_role && (
              <p className="text-md text-gray-500">{credential.holder_role}</p>
            )}
          </div>

          {/* Event Info */}
          <div className="text-center mb-4 border-t border-b border-gray-200 py-3">
            <p className="text-lg font-semibold text-gray-900">{credential.event_name}</p>
            {credential.venue_name && (
              <p className="text-sm text-gray-600">{credential.venue_name}</p>
            )}
          </div>

          {/* Validity */}
          <div className="text-center text-sm text-gray-600 mb-4">
            <p>Valid: {formatDate(credential.valid_from)}</p>
            {credential.valid_until && <p>Until: {formatDate(credential.valid_until)}</p>}
          </div>

          {/* QR Code */}
          <div className="flex-1 flex flex-col items-center justify-end">
            <canvas ref={qrCanvasRef} className="mb-2" />
            <p className="text-xs font-mono text-gray-500">{credential.credential_number}</p>
          </div>

          {/* Access Permissions (small print) */}
          <div className="mt-4 text-xs text-gray-500 text-center">
            {credential.access_permissions.backstage && '🎭 Backstage '}
            {credential.access_permissions.stage_access && '🎤 Stage '}
            {credential.access_permissions.vip_areas && '⭐ VIP '}
            {credential.access_permissions.production_areas && '🔧 Production '}
          </div>
        </div>
      </div>

      {/* Print Button (hidden when printing) */}
      <div className="no-print mt-8 text-center">
        <button
          onClick={() => window.print()}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Print Badge
        </button>
      </div>
    </div>
  );
}
