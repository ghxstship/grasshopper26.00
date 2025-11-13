/**
 * Credential Detail View
 * View and manage individual credential with QR code and actions
 */

'use client';

import styles from './page.module.css';
import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/design-system/components/atoms/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/components/atoms/Card';
import { Badge } from '@/design-system/components/atoms/Badge';
import {
  ArrowLeft,
  Printer,
  XCircle,
  CheckCircle,
  Shield,
  Calendar,
  User,
  Building,
  Mail,
  Phone,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import QRCode from 'qrcode';

interface Credential {
  id: string;
  credential_type: string;
  credential_number: string;
  badge_color: string | null;
  holder_name: string;
  holder_company: string | null;
  holder_role: string | null;
  holder_email: string | null;
  holder_phone: string | null;
  is_active: boolean;
  checked_in: boolean;
  checked_in_at: string | null;
  checked_in_by: string | null;
  revoked: boolean;
  revoked_at: string | null;
  revoked_by: string | null;
  revoke_reason: string | null;
  printed: boolean;
  printed_at: string | null;
  valid_from: string;
  valid_until: string | null;
  notes: string | null;
  access_permissions: any;
  created_at: string;
}

const CREDENTIAL_TYPES: Record<string, { label: string; badge: string; color: string }> = {
  aaa: { label: 'AAA (All-Access)', badge: '⬛', color: 'black' },
  aa: { label: 'AA (Artist Access)', badge: '◼️', color: 'grey-900' },
  production: { label: 'Production Crew', badge: '▪️', color: 'grey-700' },
  staff: { label: 'Event Staff', badge: '▫️', color: 'grey-500' },
  vendor: { label: 'Vendor', badge: '◻️', color: 'grey-300' },
  media: { label: 'Media/Press', badge: '⬜', color: 'white' },
  guest: { label: 'Guest', badge: '⚪', color: 'white' },
};

export default function CredentialDetailPage({
  params,
}: {
  params: Promise<{ id: string; credentialId: string }>;
}) {
  const { id, credentialId } = use(params);
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [credential, setCredential] = useState<Credential | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  useEffect(() => {
    loadCredential();
  }, [credentialId]);

  useEffect(() => {
    if (credential) {
      generateQRCode();
    }
  }, [credential]);

  const loadCredential = async () => {
    try {
      const { data, error } = await supabase
        .from('event_credentials')
        .select('*')
        .eq('id', credentialId)
        .single();

      if (error) throw error;
      setCredential(data);
    } catch (error: any) {
      toast.error('Failed to load credential');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = async () => {
    if (!credential) return;

    try {
      const qrData = JSON.stringify({
        id: credential.id,
        number: credential.credential_number,
        type: credential.credential_type,
        holder: credential.holder_name,
      });

      const url = await QRCode.toDataURL(qrData, {
        width: 300,
        margin: 2,
        color: {
          dark: '#030712', // eslint-disable-line no-restricted-syntax -- QR codes require hardcoded colors for proper scanning
          light: '#FFFFFF', // eslint-disable-line no-restricted-syntax -- QR codes require hardcoded colors for proper scanning
        },
      });

      setQrCodeUrl(url);
    } catch (error) {
      console.error('Failed to generate QR code:', error);
    }
  };

  const handlePrint = async () => {
    try {
      const response = await fetch(`/api/admin/credentials/${credentialId}/print`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to print badge');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `badge-${credential?.credential_number}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Badge printed successfully');
      loadCredential();
    } catch (error: any) {
      toast.error('Failed to print badge');
      console.error(error);
    }
  };

  const handleRevoke = async () => {
    if (!confirm('Are you sure you want to revoke this credential?')) return;

    const reason = prompt('Please provide a reason for revocation:');
    if (!reason) return;

    try {
      const response = await fetch(`/api/admin/credentials/${credentialId}/revoke`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) throw new Error('Failed to revoke credential');

      toast.success('Credential revoked successfully');
      loadCredential();
    } catch (error: any) {
      toast.error('Failed to revoke credential');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className={styles.row}>
        <div>
          <div className={styles.loadingSpinner}></div>
          <p className={styles.loadingText}>Loading credential...</p>
        </div>
      </div>
    );
  }

  if (!credential) {
    return (
      <div className={styles.notFoundContainer}>
        <Card>
          <CardContent className={styles.section}>
            <AlertCircle className={styles.notFoundIcon} />
            <h3 className={styles.notFoundTitle}>Credential not found</h3>
            <Link href={`/admin/events/${id}/credentials`}>
              <Button>Back to Credentials</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const credType = CREDENTIAL_TYPES[credential.credential_type] || {
    label: credential.credential_type,
    badge: '⚪',
    color: 'gray',
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Link href={`/admin/events/${id}/credentials`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className={styles.icon} />
              Back
            </Button>
          </Link>
          <div>
            <h1 className={styles.title}>Credential Details</h1>
            <p className={styles.credentialNumber}>{credential.credential_number}</p>
          </div>
        </div>

        <div className={styles.headerRight}>
          {!credential.revoked && !credential.printed && (
            <Button onClick={handlePrint}>
              <Printer className={styles.icon} />
              Print Badge
            </Button>
          )}
          {!credential.revoked && (
            <Button variant="outlined" onClick={handleRevoke}>
              <XCircle className={styles.icon} />
              Revoke
            </Button>
          )}
        </div>
      </div>

      <div className={styles.grid}>
        {/* Main Info */}
        <div>
          {/* Holder Information */}
          <Card>
            <CardHeader>
              <div className={styles.cardHeader}>
                <span className={styles.badgeEmoji}>{credType.badge}</span>
                <div>
                  <CardTitle className={styles.holderName}>{credential.holder_name}</CardTitle>
                  <p className={styles.credentialType}>{credType.label}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className={styles.section}>
              {credential.holder_company && (
                <div className={styles.infoRow}>
                  <Building className={styles.infoIcon} />
                  <span>{credential.holder_company}</span>
                </div>
              )}
              {credential.holder_role && (
                <div className={styles.infoRow}>
                  <User className={styles.infoIcon} />
                  <span>{credential.holder_role}</span>
                </div>
              )}
              {credential.holder_email && (
                <div className={styles.infoRow}>
                  <Mail className={styles.infoIcon} />
                  <span>{credential.holder_email}</span>
                </div>
              )}
              {credential.holder_phone && (
                <div className={styles.infoRow}>
                  <Phone className={styles.infoIcon} />
                  <span>{credential.holder_phone}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status & Validity */}
          <Card>
            <CardHeader>
              <CardTitle>Status & Validity</CardTitle>
            </CardHeader>
            <CardContent className={styles.section}>
              <div className={styles.statusRow}>
                {credential.revoked ? (
                  <Badge variant="default">
                    <XCircle className={styles.icon} />
                    Revoked
                  </Badge>
                ) : credential.checked_in ? (
                  <Badge variant="default" className={styles.badge}>
                    <CheckCircle className={styles.icon} />
                    Checked In
                  </Badge>
                ) : credential.is_active ? (
                  <Badge variant="outlined" className={styles.badgeActive}>
                    <Shield className={styles.icon} />
                    Active
                  </Badge>
                ) : (
                  <Badge variant="outlined">
                    Inactive
                  </Badge>
                )}

                {credential.printed && (
                  <Badge variant="outlined" className={styles.badgePrinted}>
                    <Printer className={styles.icon} />
                    Printed
                  </Badge>
                )}
              </div>

              <div className={styles.gridTwo}>
                <div>
                  <p className={styles.validityLabel}>Valid From</p>
                  <div className={styles.validityValue}>
                    <Calendar className={styles.icon} />
                    <span>{new Date(credential.valid_from).toLocaleDateString()}</span>
                  </div>
                </div>
                <div>
                  <p className={styles.validityLabel}>Valid Until</p>
                  <div className={styles.validityValue}>
                    <Calendar className={styles.icon} />
                    <span>
                      {credential.valid_until
                        ? new Date(credential.valid_until).toLocaleDateString()
                        : 'Ongoing'}
                    </span>
                  </div>
                </div>
              </div>

              {credential.checked_in_at && (
                <div>
                  <p className={styles.notesLabel}>Checked In</p>
                  <p className={styles.notesText}>{new Date(credential.checked_in_at).toLocaleString()}</p>
                </div>
              )}

              {credential.printed_at && (
                <div>
                  <p className={styles.notesLabel}>Printed</p>
                  <p className={styles.notesText}>{new Date(credential.printed_at).toLocaleString()}</p>
                </div>
              )}

              {credential.revoked_at && (
                <div className={styles.revokedBox}>
                  <p className={styles.revokedLabel}>Revoked</p>
                  <p className={styles.revokedText}>{new Date(credential.revoked_at).toLocaleString()}</p>
                  {credential.revoke_reason && (
                    <p className={styles.revokedReason}>
                      <strong>Reason:</strong> {credential.revoke_reason}
                    </p>
                  )}
                </div>
              )}

              {credential.notes && (
                <div>
                  <p className={styles.notesLabel}>Notes</p>
                  <p className={styles.notesText}>{credential.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Access Permissions */}
          {credential.access_permissions && Object.keys(credential.access_permissions).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Access Permissions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={styles.gridTwo}>
                  {Object.entries(credential.access_permissions).map(([key, value]) => (
                    <div key={key} className={styles.permissionRow}>
                      {value ? (
                        <CheckCircle className={styles.permissionIcon} />
                      ) : (
                        <XCircle className={styles.permissionIcon} />
                      )}
                      <span className={styles.permissionLabel}>{key.replace(/_/g, ' ')}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* QR Code */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>QR Code</CardTitle>
            </CardHeader>
            <CardContent>
              {qrCodeUrl ? (
                <div className={styles.qrSection}>
                  <img src={qrCodeUrl} alt="Credential QR Code" className={styles.qrImage} />
                  <p className={styles.qrCaption}>
                    Scan this code to verify credential
                  </p>
                </div>
              ) : (
                <div className={styles.qrLoading}>
                  <p className={styles.qrLoadingText}>Generating QR code...</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
            </CardHeader>
            <CardContent className={styles.section}>
              <div>
                <p className={styles.metadataLabel}>Credential ID</p>
                <p className={styles.metadataValue}>{credential.id}</p>
              </div>
              <div>
                <p className={styles.metadataLabel}>Created</p>
                <p className={styles.metadataDate}>{new Date(credential.created_at).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
