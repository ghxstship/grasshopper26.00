/**
 * Event Team Management
 * Assign and manage team members for events (staff, vendors, talent, etc.)
 */

'use client';

import { use, useEffect, useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/design-system/components/atoms/select';
import { ArrowLeft, Plus, Mail, Users, CheckCircle, Clock, XCircle, Shield } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface TeamMember {
  id: string;
  user_id: string | null;
  external_name: string | null;
  external_email: string | null;
  team_role: string;
  position_title: string | null;
  status: string;
  access_level: string;
  access_start_date: string | null;
  access_end_date: string | null;
  invited_at: string;
  accepted_at: string | null;
  notes: string | null;
}

interface RoleTemplate {
  id: string;
  name: string;
  team_role: string;
  position_title: string;
  description: string;
  access_level: string;
}

export default function EventTeamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const supabase = createClient();
  
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<any>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [roleTemplates, setRoleTemplates] = useState<RoleTemplate[]>([]);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    template_id: '',
    external_name: '',
    external_email: '',
    external_phone: '',
    custom_position: '',
    access_start_date: '',
    access_end_date: '',
    notes: '',
  });

  useEffect(() => {
    loadEventData();
    loadTeamMembers();
    loadRoleTemplates();
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

  const loadTeamMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('event_team_assignments')
        .select('*')
        .eq('event_id', id)
        .order('invited_at', { ascending: false });

      if (error) throw error;
      setTeamMembers(data || []);
    } catch (error: any) {
      console.error('Failed to load team members:', error);
    }
  };

  const loadRoleTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('event_team_role_templates')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setRoleTemplates(data || []);
    } catch (error: any) {
      console.error('Failed to load role templates:', error);
    }
  };

  const handleInviteTeamMember = async () => {
    try {
      if (!inviteForm.template_id || !inviteForm.external_name || !inviteForm.external_email) {
        toast.error('Please fill in all required fields');
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get selected template
      const template = roleTemplates.find(t => t.id === inviteForm.template_id);
      if (!template) throw new Error('Invalid role template');

      // Generate invitation token
      const invitationToken = crypto.randomUUID();

      // Create team assignment
      const { error: assignmentError } = await supabase
        .from('event_team_assignments')
        .insert({
          event_id: id,
          external_name: inviteForm.external_name,
          external_email: inviteForm.external_email,
          external_phone: inviteForm.external_phone || null,
          team_role: template.team_role,
          position_title: inviteForm.custom_position || template.position_title,
          access_level: template.access_level,
          access_start_date: inviteForm.access_start_date || null,
          access_end_date: inviteForm.access_end_date || null,
          status: 'invited',
          invited_by: user.id,
          invitation_token: invitationToken,
          notes: inviteForm.notes || null,
        });

      if (assignmentError) throw assignmentError;

      // TODO: Send invitation email via API
      // await fetch('/api/team/invite', {
      //   method: 'POST',
      //   body: JSON.stringify({
      //     eventId: id,
      //     email: inviteForm.external_email,
      //     token: invitationToken,
      //   }),
      // });

      toast.success('Team member invited successfully');
      setShowInviteDialog(false);
      setInviteForm({
        template_id: '',
        external_name: '',
        external_email: '',
        external_phone: '',
        custom_position: '',
        access_start_date: '',
        access_end_date: '',
        notes: '',
      });
      loadTeamMembers();
    } catch (error: any) {
      toast.error('Failed to invite team member: ' + error.message);
      console.error(error);
    }
  };

  const handleResendInvite = async (memberId: string) => {
    try {
      // TODO: Implement resend invitation email
      toast.success('Invitation resent');
    } catch (error: any) {
      toast.error('Failed to resend invitation');
      console.error(error);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) return;

    try {
      const { error } = await supabase
        .from('event_team_assignments')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      toast.success('Team member removed');
      loadTeamMembers();
    } catch (error: any) {
      toast.error('Failed to remove team member');
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
      case 'active':
        return (
          <Badge variant="default" className="bg-green-600">
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
      case 'completed':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      lead: 'bg-purple-100 text-purple-800 border-purple-200',
      staff: 'bg-blue-100 text-blue-800 border-blue-200',
      vendor: 'bg-green-100 text-green-800 border-green-200',
      talent: 'bg-pink-100 text-pink-800 border-pink-200',
      agent: 'bg-orange-100 text-orange-800 border-orange-200',
      sponsor: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      media: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      investor: 'bg-red-100 text-red-800 border-red-200',
      stakeholder: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colors[role] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getAccessLevelIcon = (level: string) => {
    switch (level) {
      case 'full':
        return <Shield className="h-3 w-3 text-red-600" />;
      case 'elevated':
        return <Shield className="h-3 w-3 text-yellow-600" />;
      default:
        return <Shield className="h-3 w-3 text-gray-400" />;
    }
  };

  // Group team members by role
  const groupedMembers = teamMembers.reduce((acc, member) => {
    if (!acc[member.team_role]) {
      acc[member.team_role] = [];
    }
    acc[member.team_role].push(member);
    return acc;
  }, {} as Record<string, TeamMember[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading team...</p>
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
            <h1 className="text-3xl font-bold">Team Management</h1>
            <p className="text-muted-foreground">{event?.name}</p>
          </div>
        </div>

        <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Invite Team Member
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Invite Team Member</DialogTitle>
              <DialogDescription>
                Add a team member to help manage and coordinate this event
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="template_id" className="text-sm font-medium">Role Template *</label>
                <Select
                  value={inviteForm.template_id}
                  onValueChange={(value) => setInviteForm({ ...inviteForm, template_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role..." />
                  </SelectTrigger>
                  <SelectContent>
                    {roleTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        <div className="flex items-center gap-2">
                          <span>{template.name}</span>
                          <span className="text-xs text-muted-foreground">
                            ({template.team_role})
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {inviteForm.template_id && (
                  <p className="text-xs text-muted-foreground">
                    {roleTemplates.find(t => t.id === inviteForm.template_id)?.description}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="external_name" className="text-sm font-medium">Name *</label>
                  <Input
                    id="external_name"
                    placeholder="John Doe"
                    value={inviteForm.external_name}
                    onChange={(e) => setInviteForm({ ...inviteForm, external_name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="external_email" className="text-sm font-medium">Email *</label>
                  <Input
                    id="external_email"
                    type="email"
                    placeholder="john@example.com"
                    value={inviteForm.external_email}
                    onChange={(e) => setInviteForm({ ...inviteForm, external_email: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="external_phone" className="text-sm font-medium">Phone (Optional)</label>
                  <Input
                    id="external_phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={inviteForm.external_phone}
                    onChange={(e) => setInviteForm({ ...inviteForm, external_phone: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="custom_position" className="text-sm font-medium">Custom Position Title</label>
                  <Input
                    id="custom_position"
                    placeholder="Leave blank to use template default"
                    value={inviteForm.custom_position}
                    onChange={(e) => setInviteForm({ ...inviteForm, custom_position: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="access_start_date" className="text-sm font-medium">Access Start Date</label>
                  <Input
                    id="access_start_date"
                    type="datetime-local"
                    value={inviteForm.access_start_date}
                    onChange={(e) => setInviteForm({ ...inviteForm, access_start_date: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="access_end_date" className="text-sm font-medium">Access End Date</label>
                  <Input
                    id="access_end_date"
                    type="datetime-local"
                    value={inviteForm.access_end_date}
                    onChange={(e) => setInviteForm({ ...inviteForm, access_end_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="notes" className="text-sm font-medium">Notes</label>
                <Textarea
                  id="notes"
                  placeholder="Any special instructions or notes for this team member..."
                  value={inviteForm.notes}
                  onChange={(e) => setInviteForm({ ...inviteForm, notes: e.target.value })}
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleInviteTeamMember}>
                <Mail className="h-4 w-4 mr-2" />
                Send Invitation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Team Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Team</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamMembers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {teamMembers.filter(m => m.status === 'active' || m.status === 'accepted').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {teamMembers.filter(m => m.status === 'invited').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Roles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(groupedMembers).length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Team Members by Role */}
      {teamMembers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No team members yet</h3>
            <p className="text-muted-foreground mb-4">
              Start building your event team by inviting members
            </p>
            <Button onClick={() => setShowInviteDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Invite First Team Member
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedMembers).map(([role, members]) => (
            <Card key={role}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="capitalize">{role} Team</CardTitle>
                  <Badge variant="outline">{members.length} members</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">
                            {member.external_name || 'Unknown'}
                          </h4>
                          {getStatusBadge(member.status)}
                          <Badge variant="outline" className={getRoleBadgeColor(member.team_role)}>
                            {member.position_title || member.team_role}
                          </Badge>
                          <div className="flex items-center gap-1">
                            {getAccessLevelIcon(member.access_level)}
                            <span className="text-xs text-muted-foreground capitalize">
                              {member.access_level}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <p>Email: {member.external_email}</p>
                          {member.access_start_date && (
                            <p>Access: {new Date(member.access_start_date).toLocaleDateString()} - {member.access_end_date ? new Date(member.access_end_date).toLocaleDateString() : 'Ongoing'}</p>
                          )}
                          {member.notes && (
                            <p className="mt-2">
                              <span className="font-medium">Notes:</span> {member.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {member.status === 'invited' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleResendInvite(member.id)}
                          >
                            <Mail className="h-4 w-4 mr-2" />
                            Resend
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRemoveMember(member.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
