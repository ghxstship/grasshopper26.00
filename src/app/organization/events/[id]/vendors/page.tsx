/**
 * Event Vendor Management
 * Vendor invitation, onboarding, and coordination interface
 */

'use client';

import { use, useEffect, useState } from 'react';
import { ContextualPageTemplate } from '@/design-system/components/templates';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/design-system/components/atoms/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/components/atoms/Card';
import { Badge } from '@/design-system/components/atoms/Badge';
import { Plus, CheckCircle, Clock, XCircle, Store } from 'lucide-react';
import { toast } from 'sonner';
import styles from './vendors-content.module.css';

interface Vendor {
  id: string;
  company_name: string;
  contact_name: string;
  contact_email: string;
  vendor_type: string;
  status: 'invited' | 'accepted' | 'declined' | 'active';
  load_in_time: string | null;
  load_out_time: string | null;
  special_requirements: string | null;
  invited_at: string;
  accepted_at: string | null;
}

export default function EventVendorsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const supabase = createClient();
  
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<any>(null);
  const [vendors, setVendors] = useState<Vendor[]>([]);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

      if (eventError) throw eventError;
      setEvent(eventData);

      const { data: vendorsData, error: vendorsError } = await supabase
        .from('event_vendors')
        .select('*')
        .eq('event_id', id)
        .order('invited_at', { ascending: false });

      if (vendorsError) throw vendorsError;
      setVendors(vendorsData || []);
    } catch (error: any) {
      toast.error('Failed to load data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      invited: { variant: 'outlined' as const, icon: <Clock /> },
      accepted: { variant: 'default' as const, icon: <CheckCircle /> },
      declined: { variant: 'sold-out' as const, icon: <XCircle /> },
      active: { variant: 'default' as const, icon: <CheckCircle /> },
    };
    return variants[status as keyof typeof variants] || variants.invited;
  };

  const stats = {
    total: vendors.length,
    accepted: vendors.filter(v => v.status === 'accepted' || v.status === 'active').length,
    pending: vendors.filter(v => v.status === 'invited').length,
  };

  return (
    <ContextualPageTemplate
      breadcrumbs={[
        { label: 'Events', href: '/admin/events' },
        { label: event?.name || 'Event', href: `/admin/events/${id}` },
        { label: 'Vendors', href: `/admin/events/${id}/vendors` }
      ]}
      title="Event Vendors"
      subtitle={event?.name ? `${event.name} - Manage vendors and suppliers` : 'Manage vendors and suppliers'}
      primaryAction={{
        label: 'Invite Vendor',
        href: `/admin/events/${id}/vendors/invite`,
        icon: <Plus />
      }}
      metadata={
        <div>{stats.total} Total Vendors • {stats.accepted} Accepted • {stats.pending} Pending</div>
      }
      loading={loading}
    >
      <div className={styles.vendorsGrid}>
        {vendors.map((vendor) => {
          const statusBadge = getStatusBadge(vendor.status);
          return (
            <Card key={vendor.id}>
              <CardHeader>
                <div className={styles.vendorHeader}>
                  <CardTitle>{vendor.company_name}</CardTitle>
                  <Badge variant={statusBadge.variant}>
                    {statusBadge.icon}
                    {vendor.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className={styles.vendorDetails}>
                  <p className={styles.vendorDetail}>
                    <strong>Contact:</strong> {vendor.contact_name}
                  </p>
                  <p className={styles.vendorDetail}>
                    <strong>Email:</strong> {vendor.contact_email}
                  </p>
                  <p className={styles.vendorDetail}>
                    <strong>Type:</strong> {vendor.vendor_type}
                  </p>
                  {vendor.special_requirements && (
                    <p className={styles.vendorRequirements}>
                      {vendor.special_requirements}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </ContextualPageTemplate>
  );
}
