/**
 * Event Vendor Management
 * Vendor invitation, onboarding, and coordination interface
 */

'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/design-system/components/atoms/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/components/atoms/card';
import { Input } from '@/design-system/components/atoms/input';
import { Badge } from '@/design-system/components/atoms/badge';
import { Textarea } from '@/design-system/components/atoms/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/design-system/components/atoms/dialog';
import { ArrowLeft, Plus, Mail, CheckCircle, Clock, XCircle, FileText } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

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
  const router = useRouter();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<any>(null);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    company_name: '',
    contact_name: '',
    contact_email: '',
    vendor_type: '',
    load_in_time: '',
    load_out_time: '',
    special_requirements: '',
  });

  useEffect(() => {
    loadEventData();
    loadVendors();
  }, [id]);

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

  const loadVendors = async () => {
    try {
      const { data, error } = await supabase
        .from('event_vendors')
        .select('*')
        .eq('event_id', id)
        .order('invited_at', { ascending: false });

      if (error) throw error;
      setVendors(data || []);
    } catch (error: any) {
      console.error('Failed to load vendors:', error);
    }
  };

  const handleInviteVendor = async () => {
    try {
      if (!inviteForm.company_name || !inviteForm.contact_email || !inviteForm.vendor_type) {
        toast.error('Please fill in all required fields');
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Create vendor record
      const { data: vendor, error: vendorError } = await supabase
        .from('event_vendors')
        .insert({
          event_id: id,
          company_name: inviteForm.company_name,
          contact_name: inviteForm.contact_name,
          contact_email: inviteForm.contact_email,
          vendor_type: inviteForm.vendor_type,
          load_in_time: inviteForm.load_in_time || null,
          load_out_time: inviteForm.load_out_time || null,
          special_requirements: inviteForm.special_requirements || null,
          status: 'invited',
          invited_at: new Date().toISOString(),
          invited_by: user.id,
        })
        .select()
        .single();

      if (vendorError) throw vendorError;

      // TODO: Send invitation email via API
      // await fetch('/api/vendors/invite', {
      //   method: 'POST',
      //   body: JSON.stringify({ vendorId: vendor.id, eventId: id }),
      // });

      toast.success('Vendor invited successfully');
      setShowInviteDialog(false);
      setInviteForm({
        company_name: '',
        contact_name: '',
        contact_email: '',
        vendor_type: '',
        load_in_time: '',
        load_out_time: '',
        special_requirements: '',
      });
      loadVendors();
    } catch (error: any) {
      toast.error('Failed to invite vendor: ' + error.message);
      console.error(error);
    }
  };

  const handleResendInvite = async (vendorId: string) => {
    try {
      // TODO: Implement resend invitation email
      toast.success('Invitation resent');
    } catch (error: any) {
      toast.error('Failed to resend invitation');
      console.error(error);
    }
  };

  const handleRemoveVendor = async (vendorId: string) => {
    if (!confirm('Are you sure you want to remove this vendor?')) return;

    try {
      const { error } = await supabase
        .from('event_vendors')
        .delete()
        .eq('id', vendorId);

      if (error) throw error;

      toast.success('Vendor removed');
      loadVendors();
    } catch (error: any) {
      toast.error('Failed to remove vendor');
      console.error(error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'invited':
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            Invited
          </Badge>
        );
      case 'accepted':
        return (
          <Badge variant="default" className="bg-green-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            Accepted
          </Badge>
        );
      case 'active':
        return (
          <Badge variant="default" className="bg-blue-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </Badge>
        );
      case 'declined':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Declined
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const vendorTypes = [
    'Catering',
    'Audio/Visual',
    'Security',
    'Cleaning',
    'Decorations',
    'Photography',
    'Videography',
    'Transportation',
    'Equipment Rental',
    'Other',
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading vendors...</p>
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
            <h1 className="text-3xl font-bold">Vendor Management</h1>
            <p className="text-muted-foreground">{event?.name}</p>
          </div>
        </div>

        <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Invite Vendor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Invite Vendor</DialogTitle>
              <DialogDescription>
                Send an invitation to a vendor to participate in this event
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="company_name" className="text-sm font-medium">Company Name *</label>
                  <Input
                    id="company_name"
                    placeholder="ABC Catering Co."
                    value={inviteForm.company_name}
                    onChange={(e) => setInviteForm({ ...inviteForm, company_name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="contact_name" className="text-sm font-medium">Contact Name</label>
                  <Input
                    id="contact_name"
                    placeholder="John Doe"
                    value={inviteForm.contact_name}
                    onChange={(e) => setInviteForm({ ...inviteForm, contact_name: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="contact_email" className="text-sm font-medium">Contact Email *</label>
                  <Input
                    id="contact_email"
                    type="email"
                    placeholder="vendor@example.com"
                    value={inviteForm.contact_email}
                    onChange={(e) => setInviteForm({ ...inviteForm, contact_email: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="vendor_type" className="text-sm font-medium">Vendor Type *</label>
                  <select
                    id="vendor_type"
                    className="w-full px-3 py-2 border rounded-md"
                    value={inviteForm.vendor_type}
                    onChange={(e) => setInviteForm({ ...inviteForm, vendor_type: e.target.value })}
                  >
                    <option value="">Select type...</option>
                    {vendorTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="load_in_time" className="text-sm font-medium">Load-In Time</label>
                  <Input
                    id="load_in_time"
                    type="datetime-local"
                    value={inviteForm.load_in_time}
                    onChange={(e) => setInviteForm({ ...inviteForm, load_in_time: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="load_out_time" className="text-sm font-medium">Load-Out Time</label>
                  <Input
                    id="load_out_time"
                    type="datetime-local"
                    value={inviteForm.load_out_time}
                    onChange={(e) => setInviteForm({ ...inviteForm, load_out_time: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="special_requirements" className="text-sm font-medium">Special Requirements</label>
                <Textarea
                  id="special_requirements"
                  placeholder="Any special requirements, access needs, or notes..."
                  value={inviteForm.special_requirements}
                  onChange={(e) => setInviteForm({ ...inviteForm, special_requirements: e.target.value })}
                  rows={4}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleInviteVendor}>
                <Mail className="h-4 w-4 mr-2" />
                Send Invitation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Vendors List */}
      <div className="space-y-4">
        {vendors.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No vendors yet</h3>
              <p className="text-muted-foreground mb-4">
                Start by inviting vendors to participate in your event
              </p>
              <Button onClick={() => setShowInviteDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Invite First Vendor
              </Button>
            </CardContent>
          </Card>
        ) : (
          vendors.map((vendor) => (
            <Card key={vendor.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{vendor.company_name}</h3>
                      {getStatusBadge(vendor.status)}
                      <Badge variant="outline">{vendor.vendor_type}</Badge>
                    </div>

                    <div className="space-y-1 text-sm text-muted-foreground">
                      {vendor.contact_name && (
                        <p>Contact: {vendor.contact_name}</p>
                      )}
                      <p>Email: {vendor.contact_email}</p>
                      {vendor.load_in_time && (
                        <p>Load-In: {new Date(vendor.load_in_time).toLocaleString()}</p>
                      )}
                      {vendor.load_out_time && (
                        <p>Load-Out: {new Date(vendor.load_out_time).toLocaleString()}</p>
                      )}
                      {vendor.special_requirements && (
                        <p className="mt-2">
                          <span className="font-medium">Requirements:</span> {vendor.special_requirements}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {vendor.status === 'invited' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleResendInvite(vendor.id)}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Resend
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRemoveVendor(vendor.id)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
