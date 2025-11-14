/**
 * Event Credentials Management Dashboard
 * Comprehensive credential issuance, tracking, and management interface
 */

'use client';

import { use, useEffect, useState } from 'react';
import { ContextualPageTemplate } from '@/design-system';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/design-system';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system';
import { Input } from '@/design-system';
import { Badge } from '@/design-system';
import { Select } from '@/design-system';
import { Plus, Search, Shield, CheckCircle, XCircle, Printer } from 'lucide-react';
import { toast } from 'sonner';
import styles from './credentials-content.module.css';

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
  { value: 'aaa', label: 'AAA (All-Access)', badge: '🔴' },
  { value: 'aa', label: 'AA (Artist Access)', badge: '🟡' },
  { value: 'production', label: 'Production Crew', badge: '🔵' },
  { value: 'staff', label: 'Event Staff', badge: '🟢' },
  { value: 'vendor', label: 'Vendor', badge: '🟠' },
  { value: 'media', label: 'Media/Press', badge: '🟣' },
  { value: 'guest', label: 'Guest', badge: '⚪' },
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

    if (filterType !== 'all') {
      filtered = filtered.filter((cred) => cred.credential_type === filterType);
    }

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
      }
    }

    setFilteredCredentials(filtered);
  };

  const stats = {
    total: credentials.length,
    active: credentials.filter(c => c.is_active && !c.revoked).length,
    checkedIn: credentials.filter(c => c.checked_in).length,
    revoked: credentials.filter(c => c.revoked).length,
  };

  return (
    <ContextualPageTemplate
      breadcrumbs={[
        { label: 'Events', href: '/admin/events' },
        { label: event?.name || 'Event', href: `/admin/events/${id}` },
        { label: 'Credentials', href: `/admin/events/${id}/credentials` }
      ]}
      title="Event Credentials"
      subtitle={event?.name ? `${event.name} - Manage event access credentials` : 'Manage event access credentials'}
      primaryAction={{
        label: 'Issue New Credential',
        href: `/admin/events/${id}/credentials/issue`,
        icon: <Plus />
      }}
      metadata={
        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <Shield className={styles.statIcon} />
            <span className={styles.statLabel}>Total Issued</span>
            <span className={styles.statValue}>{stats.total}</span>
          </div>
          <div className={styles.statItem}>
            <CheckCircle className={styles.statIcon} />
            <span className={styles.statLabel}>Active</span>
            <span className={styles.statValue}>{stats.active}</span>
          </div>
          <div className={styles.statItem}>
            <CheckCircle className={styles.statIcon} />
            <span className={styles.statLabel}>Checked In</span>
            <span className={styles.statValue}>{stats.checkedIn}</span>
          </div>
          <div className={styles.statItem}>
            <XCircle className={styles.statIcon} />
            <span className={styles.statLabel}>Revoked</span>
            <span className={styles.statValue}>{stats.revoked}</span>
          </div>
        </div>
      }
      loading={loading}
    >
      <Card>
        <CardHeader>
          <CardTitle>Credentials List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={styles.filters}>
            <div className={styles.searchWrapper}>
              <Search className={styles.searchIcon} />
              <Input
                placeholder="Search by name, number, company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            <Select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              options={[
                { value: 'all', label: 'All Types' },
                ...CREDENTIAL_TYPES.map((type) => ({
                  value: type.value,
                  label: `${type.badge} ${type.label}`,
                })),
              ]}
            />

            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'active', label: 'Active' },
                { value: 'checked_in', label: 'Checked In' },
                { value: 'revoked', label: 'Revoked' },
              ]}
            />
          </div>

          <div className={styles.credentialsList}>
            {filteredCredentials.length === 0 ? (
              <p className={styles.emptyText}>No credentials found</p>
            ) : (
              filteredCredentials.map((credential) => {
                const credType = CREDENTIAL_TYPES.find(t => t.value === credential.credential_type);
                return (
                  <div key={credential.id} className={styles.credentialItem}>
                    <div className={styles.credentialInfo}>
                      <div className={styles.credentialHeader}>
                        <span className={styles.credentialBadge}>{credType?.badge}</span>
                        <h4 className={styles.credentialName}>{credential.holder_name}</h4>
                        {credential.checked_in && (
                          <Badge variant="default">
                            <CheckCircle className={styles.iconSmall} />
                            Checked In
                          </Badge>
                        )}
                        {credential.revoked && (
                          <Badge variant="outline">
                            <XCircle className={styles.iconSmall} />
                            Revoked
                          </Badge>
                        )}
                      </div>
                      <p className={styles.credentialDetails}>
                        {credential.credential_number} • {credType?.label}
                      </p>
                      {credential.holder_company && (
                        <p className={styles.credentialCompany}>{credential.holder_company}</p>
                      )}
                      {credential.holder_role && (
                        <p className={styles.credentialRole}>{credential.holder_role}</p>
                      )}
                    </div>
                    <div className={styles.credentialActions}>
                      <Button
                        variant="outlined"
                        size="sm"
                        onClick={() => window.open(`/admin/events/${id}/credentials/${credential.id}/badge`, '_blank')}
                      >
                        <Printer className={styles.iconSmall} />
                        Print
                      </Button>
                      <Button
                        variant="outlined"
                        size="sm"
                        onClick={() => window.location.href = `/admin/events/${id}/credentials/${credential.id}`}
                      >
                        View
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </ContextualPageTemplate>
  );
}
