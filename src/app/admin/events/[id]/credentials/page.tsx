/**
 * Event Credentials Management Dashboard
 * Comprehensive credential issuance, tracking, and management interface
 */

'use client';

import { use, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/design-system/components/atoms/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/components/atoms/card';
import { Input } from '@/design-system/components/atoms/input';
import { Badge } from '@/design-system/components/atoms/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/design-system/components/atoms/select';
import {
  ArrowLeft,
  Plus,
  Search,
  Filter,
  Download,
  CheckCircle,
  XCircle,
  AlertCircle,
  Shield,
  Printer,
  QrCode,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface Credential {
  id: string;
  credential_type: string;
  credential_number: string;
  badge_color: string | null;
  holder_name: string;
  holder_company: string | null;
  holder_role: string | null;
  is_active: boolean;
  checked_in: boolean;
  checked_in_at: string | null;
  revoked: boolean;
  revoked_at: string | null;
  printed: boolean;
  printed_at: string | null;
  valid_from: string;
  valid_until: string | null;
  created_at: string;
}

const CREDENTIAL_TYPES = [
  { value: 'aaa', label: 'AAA (All-Access)', color: 'red', badge: '🔴' },
  { value: 'aa', label: 'AA (Artist Access)', color: 'yellow', badge: '🟡' },
  { value: 'production', label: 'Production Crew', color: 'blue', badge: '🔵' },
  { value: 'staff', label: 'Event Staff', color: 'green', badge: '🟢' },
  { value: 'vendor', label: 'Vendor', color: 'orange', badge: '🟠' },
  { value: 'media', label: 'Media/Press', color: 'purple', badge: '🟣' },
  { value: 'guest', label: 'Guest', color: 'white', badge: '⚪' },
];

export default function EventCredentialsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const supabase = createClient();
  
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<any>(null);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [filteredCredentials, setFilteredCredentials] = useState<Credential[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadEventData();
    loadCredentials();
  }, [id]);

  useEffect(() => {
    applyFilters();
  }, [credentials, searchQuery, filterType, filterStatus]);

  const loadEventData = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setEvent(data);
    } catch (error: any) {
      toast.error('Failed to load event data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadCredentials = async () => {
    try {
      const { data, error } = await supabase
        .from('event_credentials')
        .select('*')
        .eq('event_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCredentials(data || []);
    } catch (error: any) {
      console.error('Failed to load credentials:', error);
      toast.error('Failed to load credentials');
    }
  };

  const applyFilters = () => {
    let filtered = [...credentials];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (cred) =>
          cred.holder_name.toLowerCase().includes(query) ||
          cred.credential_number.toLowerCase().includes(query) ||
          cred.holder_company?.toLowerCase().includes(query) ||
          cred.holder_role?.toLowerCase().includes(query)
      );
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter((cred) => cred.credential_type === filterType);
    }

    // Status filter
    if (filterStatus !== 'all') {
      switch (filterStatus) {
        case 'active':
          filtered = filtered.filter((cred) => cred.is_active && !cred.revoked);
          break;
        case 'checked_in':
          filtered = filtered.filter((cred) => cred.checked_in);
          break;
        case 'revoked':
          filtered = filtered.filter((cred) => cred.revoked);
          break;
        case 'printed':
          filtered = filtered.filter((cred) => cred.printed);
          break;
        case 'not_printed':
          filtered = filtered.filter((cred) => !cred.printed);
          break;
      }
    }

    setFilteredCredentials(filtered);
  };

  const getCredentialTypeBadge = (type: string) => {
    const credType = CREDENTIAL_TYPES.find((t) => t.value === type);
    return credType || { value: type, label: type, color: 'gray', badge: '⚪' };
  };

  const getStatusBadge = (credential: Credential) => {
    if (credential.revoked) {
      return (
        <Badge variant="destructive">
          <XCircle className="h-3 w-3 mr-1" />
          Revoked
        </Badge>
      );
    }
    if (credential.checked_in) {
      return (
        <Badge variant="default" className="bg-green-600">
          <CheckCircle className="h-3 w-3 mr-1" />
          Checked In
        </Badge>
      );
    }
    if (credential.is_active) {
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          <Shield className="h-3 w-3 mr-1" />
          Active
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
        <AlertCircle className="h-3 w-3 mr-1" />
        Inactive
      </Badge>
    );
  };

  const handlePrintBadge = async (credentialId: string) => {
    try {
      const response = await fetch(`/api/admin/credentials/${credentialId}/print`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to print badge');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `badge-${credentialId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Badge printed successfully');
      loadCredentials();
    } catch (error: any) {
      toast.error('Failed to print badge');
      console.error(error);
    }
  };

  const handleRevokeCredential = async (credentialId: string) => {
    if (!confirm('Are you sure you want to revoke this credential? This action cannot be undone.')) {
      return;
    }

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
      loadCredentials();
    } catch (error: any) {
      toast.error('Failed to revoke credential');
      console.error(error);
    }
  };

  const stats = {
    total: credentials.length,
    active: credentials.filter((c) => c.is_active && !c.revoked).length,
    checkedIn: credentials.filter((c) => c.checked_in).length,
    revoked: credentials.filter((c) => c.revoked).length,
    printed: credentials.filter((c) => c.printed).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading credentials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href={`/admin/events/${id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Event
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Credential Management</h1>
            <p className="text-muted-foreground">{event?.name}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Link href={`/admin/events/${id}/credentials/issue`}>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Issue Credential
            </Button>
          </Link>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Checked In</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.checkedIn}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Printed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.printed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Revoked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.revoked}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, number, company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {CREDENTIAL_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.badge} {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="checked_in">Checked In</SelectItem>
                <SelectItem value="printed">Printed</SelectItem>
                <SelectItem value="not_printed">Not Printed</SelectItem>
                <SelectItem value="revoked">Revoked</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Credentials List */}
      <div className="space-y-3">
        {filteredCredentials.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {credentials.length === 0 ? 'No credentials issued yet' : 'No credentials match your filters'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {credentials.length === 0
                  ? 'Start by issuing credentials to team members and guests'
                  : 'Try adjusting your search or filter criteria'}
              </p>
              {credentials.length === 0 && (
                <Link href={`/admin/events/${id}/credentials/issue`}>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Issue First Credential
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredCredentials.map((credential) => {
            const credType = getCredentialTypeBadge(credential.credential_type);
            return (
              <Card key={credential.id} className="hover:bg-accent/50 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{credType.badge}</span>
                        <div>
                          <h3 className="text-lg font-semibold">{credential.holder_name}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span className="font-mono">{credential.credential_number}</span>
                            {credential.holder_company && (
                              <>
                                <span>•</span>
                                <span>{credential.holder_company}</span>
                              </>
                            )}
                            {credential.holder_role && (
                              <>
                                <span>•</span>
                                <span>{credential.holder_role}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className={`bg-${credType.color}-50 text-${credType.color}-700 border-${credType.color}-200`}>
                          {credType.label}
                        </Badge>
                        {getStatusBadge(credential)}
                        {credential.printed && (
                          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                            <Printer className="h-3 w-3 mr-1" />
                            Printed
                          </Badge>
                        )}
                      </div>

                      <div className="mt-3 text-sm text-muted-foreground">
                        <p>Valid: {new Date(credential.valid_from).toLocaleDateString()} - {credential.valid_until ? new Date(credential.valid_until).toLocaleDateString() : 'Ongoing'}</p>
                        {credential.checked_in_at && (
                          <p>Checked in: {new Date(credential.checked_in_at).toLocaleString()}</p>
                        )}
                        {credential.revoked_at && (
                          <p className="text-red-600">Revoked: {new Date(credential.revoked_at).toLocaleString()}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {!credential.revoked && (
                        <>
                          {!credential.printed && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handlePrintBadge(credential.id)}
                            >
                              <Printer className="h-4 w-4 mr-2" />
                              Print
                            </Button>
                          )}
                          <Link href={`/admin/events/${id}/credentials/${credential.id}`}>
                            <Button size="sm" variant="outline">
                              <QrCode className="h-4 w-4 mr-2" />
                              View
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRevokeCredential(credential.id)}
                          >
                            Revoke
                          </Button>
                        </>
                      )}
                      {credential.revoked && (
                        <Badge variant="destructive">Revoked</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
