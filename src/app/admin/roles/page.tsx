'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { SuperAdminGate } from '@/lib/rbac';
import { MemberRole, TeamRole } from '@/lib/rbac/types';
import { EventRoleType } from '@/lib/rbac/event-roles';
import { PermissionsService } from '@/lib/services/permissions.service';
import { assignEventRole, EventAccessLevel } from '@/lib/rbac/event-roles';
import { assignToEventTeam, assignToBrandTeam } from '@/lib/rbac/permissions';

interface User {
  id: string;
  display_name: string;
  email: string;
  member_role: MemberRole;
  team_role: TeamRole | null;
  is_team_member: boolean;
}

interface Event {
  id: string;
  title: string;
}

interface Brand {
  id: string;
  name: string;
}

export default function RoleAssignmentPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form states
  const [memberRole, setMemberRole] = useState<MemberRole>(MemberRole.GUEST);
  const [teamRole, setTeamRole] = useState<TeamRole | ''>('');
  const [isTeamMember, setIsTeamMember] = useState(false);
  
  // Event assignment
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [eventRoleType, setEventRoleType] = useState<EventRoleType>(EventRoleType.EVENT_STAFF);
  const [eventAccessLevel, setEventAccessLevel] = useState<EventAccessLevel>(EventAccessLevel.STANDARD);
  const [eventDepartment, setEventDepartment] = useState('');
  const [eventResponsibilities, setEventResponsibilities] = useState('');
  
  // Brand assignment
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [brandTeamRole, setBrandTeamRole] = useState<TeamRole>(TeamRole.TEAM);
  const [brandDepartment, setBrandDepartment] = useState('');
  const [canManageBrand, setCanManageBrand] = useState(false);
  const [canCreateEvents, setCanCreateEvents] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      loadUserRoles();
    }
  }, [selectedUser]);

  async function loadData() {
    try {
      const supabase = createClient();
      
      const [usersRes, eventsRes, brandsRes] = await Promise.all([
        supabase.from('user_profiles').select('id, display_name, email, member_role, team_role, is_team_member').order('display_name'),
        supabase.from('events').select('id, title').order('title'),
        supabase.from('brands').select('id, name').order('name')
      ]);

      if (usersRes.data) setUsers(usersRes.data);
      if (eventsRes.data) setEvents(eventsRes.data);
      if (brandsRes.data) setBrands(brandsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
      setMessage({ type: 'error', text: 'Failed to load data' });
    } finally {
      setLoading(false);
    }
  }

  async function loadUserRoles() {
    const user = users.find(u => u.id === selectedUser);
    if (user) {
      setMemberRole(user.member_role);
      setTeamRole(user.team_role || '');
      setIsTeamMember(user.is_team_member);
    }
  }

  async function handleUpdateUserRole() {
    if (!selectedUser) return;
    
    setSaving(true);
    setMessage(null);
    
    try {
      const supabase = createClient();
      const permService = new PermissionsService();
      
      await supabase
        .from('user_profiles')
        .update({
          member_role: memberRole,
          team_role: teamRole || null,
          is_team_member: isTeamMember
        })
        .eq('id', selectedUser);

      setMessage({ type: 'success', text: 'User role updated successfully' });
      await loadData();
    } catch (error) {
      console.error('Error updating role:', error);
      setMessage({ type: 'error', text: 'Failed to update user role' });
    } finally {
      setSaving(false);
    }
  }

  async function handleAssignEventRole() {
    if (!selectedUser || !selectedEvent) return;
    
    setSaving(true);
    setMessage(null);
    
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Not authenticated');

      const responsibilities = eventResponsibilities
        .split('\n')
        .map(r => r.trim())
        .filter(r => r.length > 0);

      await assignEventRole(
        selectedEvent,
        selectedUser,
        eventRoleType,
        user.id,
        {
          department: eventDepartment || undefined,
          responsibilities: responsibilities.length > 0 ? responsibilities : undefined,
          accessLevel: eventAccessLevel
        }
      );

      setMessage({ type: 'success', text: 'Event role assigned successfully' });
      setSelectedEvent('');
      setEventDepartment('');
      setEventResponsibilities('');
    } catch (error) {
      console.error('Error assigning event role:', error);
      setMessage({ type: 'error', text: 'Failed to assign event role' });
    } finally {
      setSaving(false);
    }
  }

  async function handleAssignBrandRole() {
    if (!selectedUser || !selectedBrand) return;
    
    setSaving(true);
    setMessage(null);
    
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Not authenticated');

      await assignToBrandTeam(
        selectedBrand,
        selectedUser,
        brandTeamRole,
        user.id,
        brandDepartment || undefined,
        canManageBrand,
        canCreateEvents
      );

      setMessage({ type: 'success', text: 'Brand role assigned successfully' });
      setSelectedBrand('');
      setBrandDepartment('');
      setCanManageBrand(false);
      setCanCreateEvents(false);
    } catch (error) {
      console.error('Error assigning brand role:', error);
      setMessage({ type: 'error', text: 'Failed to assign brand role' });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <SuperAdminGate fallback={<div className="p-8"><p className="text-red-600">Access Denied: Super Admin Only</p></div>}>
      <div className="p-8 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Role Assignment Management</h1>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            {message.text}
          </div>
        )}

        {/* User Selection */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Select User</h2>
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">-- Select a user --</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.display_name} ({user.email})
              </option>
            ))}
          </select>
        </div>

        {selectedUser && (
          <>
            {/* Base Role Assignment */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">Base User Roles</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="member-role" className="block text-sm font-medium text-gray-700 mb-2">
                    Member Role
                  </label>
                  <select
                    id="member-role"
                    value={memberRole}
                    onChange={(e) => setMemberRole(e.target.value as MemberRole)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value={MemberRole.GUEST}>Guest</option>
                    <option value={MemberRole.ATTENDEE}>Attendee</option>
                    <option value={MemberRole.TRIAL_MEMBER}>Trial Member</option>
                    <option value={MemberRole.MEMBER}>Member</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="team-role" className="block text-sm font-medium text-gray-700 mb-2">
                    Team Role
                  </label>
                  <select
                    id="team-role"
                    value={teamRole}
                    onChange={(e) => setTeamRole(e.target.value as TeamRole | '')}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">None</option>
                    <option value={TeamRole.AMBASSADOR}>Ambassador</option>
                    <option value={TeamRole.PARTNER}>Partner</option>
                    <option value={TeamRole.COLLABORATOR}>Collaborator</option>
                    <option value={TeamRole.TEAM}>Team</option>
                    <option value={TeamRole.LEAD}>Lead</option>
                    <option value={TeamRole.ADMIN}>Admin</option>
                    <option value={TeamRole.SUPER_ADMIN}>Super Admin</option>
                    <option value={TeamRole.LEGEND}>Legend</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isTeamMember}
                      onChange={(e) => setIsTeamMember(e.target.checked)}
                      className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="ml-3 text-sm font-medium text-gray-700">Is Team Member</span>
                  </label>
                </div>
              </div>

              <button
                onClick={handleUpdateUserRole}
                disabled={saving}
                className="mt-6 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Updating...' : 'Update Base Roles'}
              </button>
            </div>

            {/* Event Role Assignment */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">Assign Event Role</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="event-select" className="block text-sm font-medium text-gray-700 mb-2">
                    Event
                  </label>
                  <select
                    id="event-select"
                    value={selectedEvent}
                    onChange={(e) => setSelectedEvent(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">-- Select an event --</option>
                    {events.map(event => (
                      <option key={event.id} value={event.id}>{event.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="event-role-type" className="block text-sm font-medium text-gray-700 mb-2">
                    Event Role
                  </label>
                  <select
                    id="event-role-type"
                    value={eventRoleType}
                    onChange={(e) => setEventRoleType(e.target.value as EventRoleType)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value={EventRoleType.EVENT_LEAD}>Event Lead</option>
                    <option value={EventRoleType.EVENT_STAFF}>Event Staff</option>
                    <option value={EventRoleType.VENDOR}>Vendor</option>
                    <option value={EventRoleType.TALENT}>Talent</option>
                    <option value={EventRoleType.AGENT}>Agent</option>
                    <option value={EventRoleType.SPONSOR}>Sponsor</option>
                    <option value={EventRoleType.MEDIA}>Media</option>
                    <option value={EventRoleType.INVESTOR}>Investor</option>
                    <option value={EventRoleType.STAKEHOLDER}>Stakeholder</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="access-level" className="block text-sm font-medium text-gray-700 mb-2">
                    Access Level
                  </label>
                  <select
                    id="access-level"
                    value={eventAccessLevel}
                    onChange={(e) => setEventAccessLevel(e.target.value as EventAccessLevel)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value={EventAccessLevel.STANDARD}>Standard</option>
                    <option value={EventAccessLevel.ELEVATED}>Elevated</option>
                    <option value={EventAccessLevel.RESTRICTED}>Restricted</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="event-dept" className="block text-sm font-medium text-gray-700 mb-2">
                    Department
                  </label>
                  <input
                    id="event-dept"
                    type="text"
                    value={eventDepartment}
                    onChange={(e) => setEventDepartment(e.target.value)}
                    placeholder="e.g., Operations, Marketing"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="responsibilities" className="block text-sm font-medium text-gray-700 mb-2">
                    Responsibilities (one per line)
                  </label>
                  <textarea
                    id="responsibilities"
                    value={eventResponsibilities}
                    onChange={(e) => setEventResponsibilities(e.target.value)}
                    placeholder="Check-in&#10;Ticket scanning&#10;Guest assistance"
                    rows={4}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <button
                onClick={handleAssignEventRole}
                disabled={saving || !selectedEvent}
                className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Assigning...' : 'Assign Event Role'}
              </button>
            </div>

            {/* Brand Role Assignment */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Assign Brand Role</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="brand-select" className="block text-sm font-medium text-gray-700 mb-2">
                    Brand
                  </label>
                  <select
                    id="brand-select"
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">-- Select a brand --</option>
                    {brands.map(brand => (
                      <option key={brand.id} value={brand.id}>{brand.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="brand-team-role" className="block text-sm font-medium text-gray-700 mb-2">
                    Team Role
                  </label>
                  <select
                    id="brand-team-role"
                    value={brandTeamRole}
                    onChange={(e) => setBrandTeamRole(e.target.value as TeamRole)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value={TeamRole.TEAM}>Team</option>
                    <option value={TeamRole.LEAD}>Lead</option>
                    <option value={TeamRole.ADMIN}>Admin</option>
                    <option value={TeamRole.SUPER_ADMIN}>Super Admin</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="brand-dept" className="block text-sm font-medium text-gray-700 mb-2">
                    Department
                  </label>
                  <input
                    id="brand-dept"
                    type="text"
                    value={brandDepartment}
                    onChange={(e) => setBrandDepartment(e.target.value)}
                    placeholder="e.g., Marketing, Sales"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="space-y-3">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={canManageBrand}
                      onChange={(e) => setCanManageBrand(e.target.checked)}
                      className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="ml-3 text-sm font-medium text-gray-700">Can Manage Brand</span>
                  </label>
                  
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={canCreateEvents}
                      onChange={(e) => setCanCreateEvents(e.target.checked)}
                      className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="ml-3 text-sm font-medium text-gray-700">Can Create Events</span>
                  </label>
                </div>
              </div>

              <button
                onClick={handleAssignBrandRole}
                disabled={saving || !selectedBrand}
                className="mt-6 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Assigning...' : 'Assign Brand Role'}
              </button>
            </div>
          </>
        )}
      </div>
    </SuperAdminGate>
  );
}
