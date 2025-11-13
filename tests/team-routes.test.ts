/**
 * Team Routes Integration Tests
 * Tests all routes and API endpoints in /team directory
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

describe('Team Routes', () => {
  let supabase: ReturnType<typeof createClient>;
  let testUserId: string;
  let testEventId: string;
  let authToken: string;

  beforeAll(async () => {
    supabase = createClient(supabaseUrl, supabaseKey);

    // Create test user with staff assignment
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: `test-staff-${Date.now()}@test.com`,
      password: 'TestPassword123!',
    });

    if (authError || !authData.user) {
      throw new Error('Failed to create test user');
    }

    testUserId = authData.user.id;
    authToken = authData.session?.access_token || '';

    // Create test event
    const { data: eventData, error: eventError } = await (supabase
      .from('events')
      .insert({
        title: 'Test Event for Staff',
        start_date: new Date(Date.now() + 86400000).toISOString(),
        venue_name: 'Test Venue',
        capacity: 1000,
        status: 'published',
      } as any)
      .select()
      .single() as any);

    if (eventError || !eventData) {
      throw new Error('Failed to create test event');
    }

    testEventId = eventData.id;

    // Create staff assignment
    const { error: assignmentError } = await supabase
      .from('event_team_assignments')
      .insert({
        user_id: testUserId,
        event_id: testEventId,
        event_role_type: 'event_staff',
      } as any);

    if (assignmentError) {
      throw new Error('Failed to create staff assignment');
    }
  });

  afterAll(async () => {
    // Cleanup
    if (testEventId) {
      await supabase.from('event_team_assignments').delete().eq('event_id', testEventId);
      await supabase.from('events').delete().eq('id', testEventId);
    }
    if (testUserId) {
      await supabase.auth.admin.deleteUser(testUserId);
    }
  });

  describe('GET /team (layout)', () => {
    it('should redirect unauthenticated users to login', async () => {
      const response = await fetch('http://localhost:3000/team', {
        redirect: 'manual',
      });

      expect([301, 302, 307, 308]).toContain(response.status);
      const location = response.headers.get('location');
      expect(location).toContain('/login');
    });

    it('should redirect authenticated users without staff assignment', async () => {
      // Create user without assignment
      const { data: noStaffAuth } = await supabase.auth.signUp({
        email: `test-no-staff-${Date.now()}@test.com`,
        password: 'TestPassword123!',
      });

      const response = await fetch('http://localhost:3000/team', {
        headers: {
          Cookie: `sb-access-token=${noStaffAuth.session?.access_token}`,
        },
        redirect: 'manual',
      });

      expect([301, 302, 307, 308]).toContain(response.status);
    });

    it('should allow authenticated staff users', async () => {
      const response = await fetch('http://localhost:3000/team/staff/dashboard', {
        headers: {
          Cookie: `sb-access-token=${authToken}`,
        },
      });

      expect(response.status).toBe(200);
    });
  });

  describe('GET /team/staff/dashboard', () => {
    it('should return 200 for authenticated staff', async () => {
      const response = await fetch('http://localhost:3000/team/staff/dashboard', {
        headers: {
          Cookie: `sb-access-token=${authToken}`,
        },
      });

      expect(response.status).toBe(200);
      const html = await response.text();
      expect(html).toContain('Event Staff Dashboard');
    });

    it('should redirect unauthenticated users', async () => {
      const response = await fetch('http://localhost:3000/team/staff/dashboard', {
        redirect: 'manual',
      });

      expect([301, 302, 307, 308]).toContain(response.status);
    });
  });

  describe('GET /team/staff/scanner', () => {
    it('should return 200 for authenticated staff with eventId', async () => {
      const response = await fetch(
        `http://localhost:3000/team/staff/scanner?eventId=${testEventId}`,
        {
          headers: {
            Cookie: `sb-access-token=${authToken}`,
          },
        }
      );

      expect(response.status).toBe(200);
      const html = await response.text();
      expect(html).toContain('Ticket Scanner');
    });

    it('should show error without eventId', async () => {
      const response = await fetch('http://localhost:3000/team/staff/scanner', {
        headers: {
          Cookie: `sb-access-token=${authToken}`,
        },
      });

      expect(response.status).toBe(200);
      const html = await response.text();
      expect(html).toContain('No event selected');
    });

    it('should redirect unauthenticated users', async () => {
      const response = await fetch(
        `http://localhost:3000/team/staff/scanner?eventId=${testEventId}`,
        {
          redirect: 'manual',
        }
      );

      expect([301, 302, 307, 308]).toContain(response.status);
    });
  });

  describe('Database queries', () => {
    it('should fetch event assignments correctly', async () => {
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
        .eq('user_id', testUserId)
        .is('removed_at', null);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.length).toBeGreaterThan(0);
    });

    it('should fetch event stats correctly', async () => {
      const { data: event, error: eventError } = await (supabase
        .from('events')
        .select('capacity')
        .eq('id', testEventId)
        .single() as any);

      expect(eventError).toBeNull();
      expect(event).toBeDefined();
      expect(event?.capacity).toBe(1000);
    });

    it('should fetch tickets for check-in count', async () => {
      const { data, error } = await supabase
        .from('tickets')
        .select('id, checked_in_at, orders!inner(event_id)')
        .eq('orders.event_id', testEventId)
        .eq('status', 'active');

      expect(error).toBeNull();
      expect(data).toBeDefined();
    });
  });
});
