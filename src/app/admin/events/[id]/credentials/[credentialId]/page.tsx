/**
 * Credential Detail View
 * View and manage individual credential with QR code and actions
 */

'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/design-system/components/atoms/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/components/atoms/card';
import { Badge } from '@/design-system/components/atoms/badge';
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
  aaa: { label: 'AAA (All-Access)', badge: '🔴', color: 'red' },
  aa: { label: 'AA (Artist Access)', badge: '🟡', color: 'yellow' },
  production: { label: 'Production Crew', badge: '🔵', color: 'blue' },
  staff: { label: 'Event Staff', badge: '🟢', color: 'green' },
  vendor: { label: 'Vendor', badge: '🟠', color: 'orange' },
  media: { label: 'Media/Press', badge: '🟣', color: 'purple' },
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
          dark: '#000000',
          light: '#FFFFFF',
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading credential...</p>
        </div>
      </div>
    );
  }

  if (!credential) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Credential not found</h3>
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
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href={`/admin/events/${id}/credentials`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Credential Details</h1>
            <p className="text-muted-foreground font-mono">{credential.credential_number}</p>
          </div>
        </div>

        <div className="flex gap-2">
          {!credential.revoked && !credential.printed && (
            <Button onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print Badge
            </Button>
          )}
          {!credential.revoked && (
            <Button variant="destructive" onClick={handleRevoke}>
              <XCircle className="h-4 w-4 mr-2" />
              Revoke
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Holder Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <span className="text-5xl">{credType.badge}</span>
                <div>
                  <CardTitle className="text-2xl">{credential.holder_name}</CardTitle>
                  <p className="text-muted-foreground">{credType.label}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {credential.holder_company && (
                <div className="flex items-center gap-3">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span>{credential.holder_company}</span>
                </div>
              )}
              {credential.holder_role && (
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{credential.holder_role}</span>
                </div>
              )}
              {credential.holder_email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{credential.holder_email}</span>
                </div>
              )}
              {credential.holder_phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
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
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                {credential.revoked ? (
                  <Badge variant="destructive" className="text-base">
                    <XCircle className="h-4 w-4 mr-2" />
                    Revoked
                  </Badge>
                ) : credential.checked_in ? (
                  <Badge variant="default" className="bg-green-600 text-base">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Checked In
                  </Badge>
                ) : credential.is_active ? (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-base">
                    <Shield className="h-4 w-4 mr-2" />
                    Active
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-base">
                    Inactive
                  </Badge>
                )}

                {credential.printed && (
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-base">
                    <Printer className="h-4 w-4 mr-2" />
                    Printed
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">Valid From</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(credential.valid_from).toLocaleDateString()}</span>
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Valid Until</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
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
                  <p className="text-muted-foreground text-sm mb-1">Checked In</p>
                  <p className="text-sm">{new Date(credential.checked_in_at).toLocaleString()}</p>
                </div>
              )}

              {credential.printed_at && (
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Printed</p>
                  <p className="text-sm">{new Date(credential.printed_at).toLocaleString()}</p>
                </div>
              )}

              {credential.revoked_at && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm font-medium text-red-900 mb-1">Revoked</p>
                  <p className="text-sm text-red-700">{new Date(credential.revoked_at).toLocaleString()}</p>
                  {credential.revoke_reason && (
                    <p className="text-sm text-red-700 mt-2">
                      <strong>Reason:</strong> {credential.revoke_reason}
                    </p>
                  )}
                </div>
              )}

              {credential.notes && (
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Notes</p>
                  <p className="text-sm">{credential.notes}</p>
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
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {Object.entries(credential.access_permissions).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2">
                      {value ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* QR Code */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>QR Code</CardTitle>
            </CardHeader>
            <CardContent>
              {qrCodeUrl ? (
                <div className="space-y-4">
                  <img src={qrCodeUrl} alt="Credential QR Code" className="w-full rounded-lg border" />
                  <p className="text-xs text-center text-muted-foreground">
                    Scan this code to verify credential
                  </p>
                </div>
              ) : (
                <div className="aspect-square flex items-center justify-center bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Generating QR code...</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground">Credential ID</p>
                <p className="font-mono text-xs">{credential.id}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Created</p>
                <p>{new Date(credential.created_at).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
