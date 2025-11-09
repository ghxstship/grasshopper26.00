'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { EventStaffGate } from '@/lib/rbac';
import { useAuth } from '@/hooks/use-auth';
import Link from 'next/link';

interface EventAssignment {
  id: string;
  event_id: string;
  event_role_type: string;
  event: {
    id: string;
    title: string;
    start_date: string;
    venue_name: string;
    capacity: number;
  };
}

interface EventStats {
  totalCapacity: number;
  checkedIn: number;
  remaining: number;
  percentFull: number;
}

export default function StaffDashboardPage() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<EventAssignment[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [stats, setStats] = useState<EventStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (user) {
      loadAssignments();
    }
  }, [user]);

  useEffect(() => {
    if (selectedEvent) {
      loadEventStats();
    }
  }, [selectedEvent, refreshKey]);

  async function loadAssignments() {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('event_team_assignments')
        .select(`
          id,
          event_id,
          event_role_type,
          event:events!inner(
            id,
            title,
            start_date,
            venue_name,
            capacity
          )
        `)
        .eq('user_id', user?.id)
        .is('removed_at', null)
        .gte('event.start_date', new Date().toISOString())
        .order('event.start_date', { ascending: true });

      if (error) throw error;

      setAssignments(data as any || []);
      
      // Auto-select first event
      if (data && data.length > 0 && !selectedEvent) {
        setSelectedEvent(data[0].event_id);
      }
    } catch (error) {
      console.error('Error loading assignments:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadEventStats() {
    if (!selectedEvent) return;

    try {
      const supabase = createClient();

      // Get event details
      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('capacity')
        .eq('id', selectedEvent)
        .single();

      if (eventError) throw eventError;

      // Get checked-in count
      const { data: tickets, error: ticketsError } = await supabase
        .from('tickets')
        .select('id, checked_in_at, orders!inner(event_id)')
        .eq('orders.event_id', selectedEvent)
        .eq('status', 'active');

      if (ticketsError) throw ticketsError;

      const checkedIn = tickets?.filter(t => t.checked_in_at).length || 0;
      const totalCapacity = event.capacity || 0;
      const remaining = totalCapacity - checkedIn;
      const percentFull = totalCapacity > 0 ? (checkedIn / totalCapacity) * 100 : 0;

      setStats({
        totalCapacity,
        checkedIn,
        remaining,
        percentFull,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }

  function refreshStats() {
    setRefreshKey(prev => prev + 1);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (assignments.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">📋</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Event Assignments</h2>
          <p className="text-sm text-gray-600">You don&apos;t have any upcoming event assignments. Contact your event manager for access.</p>
        </div>
      </div>
    );
  }

  const currentAssignment = assignments.find(a => a.event_id === selectedEvent);
  const currentEvent = currentAssignment?.event;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-optimized header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="p-4">
          <h1 className="text-xl font-bold text-gray-900">Event Staff Dashboard</h1>
          <p className="text-sm text-gray-600">Welcome, {user?.email}</p>
        </div>

        {/* Event selector */}
        {assignments.length > 1 && (
          <div className="px-4 pb-4">
            <select
              value={selectedEvent || ''}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              {assignments.map(assignment => (
                <option key={assignment.id} value={assignment.event_id}>
                  {assignment.event.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="p-4 space-y-4">
        {/* Event info card */}
        {currentEvent && (
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">{currentEvent.title}</h2>
            <div className="space-y-1 text-sm text-gray-600">
              <p>📍 {currentEvent.venue_name}</p>
              <p>📅 {new Date(currentEvent.start_date).toLocaleDateString()}</p>
              <p>👥 Capacity: {currentEvent.capacity?.toLocaleString()}</p>
            </div>
          </div>
        )}

        {/* Real-time capacity stats */}
        {stats && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow-md p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-900">Live Capacity</h3>
              <button
                onClick={refreshStats}
                className="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                🔄 Refresh
              </button>
            </div>

            {/* Progress bar */}
            <div className="mb-3">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-700">Checked In</span>
                <span className="font-semibold text-gray-900">
                  {stats.checkedIn} / {stats.totalCapacity}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${
                    stats.percentFull >= 90 ? 'bg-red-600' :
                    stats.percentFull >= 75 ? 'bg-yellow-600' :
                    'bg-green-600'
                  }`}
                  style={{ width: `${Math.min(stats.percentFull, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {stats.percentFull.toFixed(1)}% full
              </p>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-green-600">{stats.checkedIn}</p>
                <p className="text-xs text-gray-600">Checked In</p>
              </div>
              <div className="bg-white rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-blue-600">{stats.remaining}</p>
                <p className="text-xs text-gray-600">Remaining</p>
              </div>
            </div>

            {/* Capacity warning */}
            {stats.percentFull >= 90 && (
              <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800 font-medium">⚠️ Near Capacity</p>
                <p className="text-xs text-red-700">Prepare for capacity management protocols</p>
              </div>
            )}
          </div>
        )}

        {/* Quick actions */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href={`/staff/scanner?eventId=${selectedEvent}`}
              className="flex flex-col items-center justify-center p-4 bg-green-50 border-2 border-green-200 rounded-lg hover:bg-green-100 transition-colors"
            >
              <span className="text-3xl mb-2">📱</span>
              <span className="text-sm font-medium text-green-900">Scan Tickets</span>
            </Link>

            <button
              onClick={refreshStats}
              className="flex flex-col items-center justify-center p-4 bg-blue-50 border-2 border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <span className="text-3xl mb-2">📊</span>
              <span className="text-sm font-medium text-blue-900">View Stats</span>
            </button>

            <Link
              href={`/staff/issues?eventId=${selectedEvent}`}
              className="flex flex-col items-center justify-center p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors"
            >
              <span className="text-3xl mb-2">⚠️</span>
              <span className="text-sm font-medium text-yellow-900">Report Issue</span>
            </Link>

            <Link
              href={`/staff/notes?eventId=${selectedEvent}`}
              className="flex flex-col items-center justify-center p-4 bg-purple-50 border-2 border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <span className="text-3xl mb-2">📝</span>
              <span className="text-sm font-medium text-purple-900">Quick Notes</span>
            </Link>
          </div>
        </div>

        {/* Recent activity */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Recent Activity</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-2 bg-gray-50 rounded">
              <span className="text-green-600">✓</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Ticket scanned</p>
                <p className="text-xs text-gray-600">2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2 bg-gray-50 rounded">
              <span className="text-blue-600">ℹ️</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Shift started</p>
                <p className="text-xs text-gray-600">1 hour ago</p>
              </div>
            </div>
          </div>
        </div>

        {/* Help & Support */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Need Help?</h3>
          <div className="space-y-2 text-sm">
            <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              📞 Contact Event Manager
            </button>
            <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              📖 View Staff Guide
            </button>
            <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              🆘 Emergency Protocols
            </button>
          </div>
        </div>
      </div>

      {/* Bottom padding for mobile */}
      <div className="h-20" />
    </div>
  );
}
