/**
 * Event-Specific Role React Hooks
 * Custom hooks for event role permission checking
 */

'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import {
  getUserEventRole,
  hasActiveEventAssignment,
  hasEventPermission,
  getUserEventPermissions,
  getEventRoleDefinition,
  checkMultipleEventPermissions,
  EventRoleType,
  EventRoleDefinition
} from './event-roles';

/**
 * Hook to get user's event-specific role
 */
export function useEventRole(eventId: string | undefined) {
  const { user } = useAuth();
  const [eventRole, setEventRole] = useState<EventRoleType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchEventRole() {
      if (!user?.id || !eventId) {
        setEventRole(null);
        setLoading(false);
        return;
      }

      try {
        const role = await getUserEventRole(user.id, eventId);
        setEventRole(role);
      } catch (error) {
        console.error('Error fetching event role:', error);
        setEventRole(null);
      } finally {
        setLoading(false);
      }
    }

    fetchEventRole();
  }, [user?.id, eventId]);

  return { eventRole, loading };
}

/**
 * Hook to check if user has active event assignment
 */
export function useHasEventAssignment(eventId: string | undefined) {
  const { user } = useAuth();
  const [hasAssignment, setHasAssignment] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function checkAssignment() {
      if (!user?.id || !eventId) {
        setHasAssignment(false);
        setLoading(false);
        return;
      }

      try {
        const result = await hasActiveEventAssignment(user.id, eventId);
        setHasAssignment(result);
      } catch (error) {
        console.error('Error checking event assignment:', error);
        setHasAssignment(false);
      } finally {
        setLoading(false);
      }
    }

    checkAssignment();
  }, [user?.id, eventId]);

  return { hasAssignment, loading };
}

/**
 * Hook to check event-specific permission
 */
export function useEventPermission(
  eventId: string | undefined,
  permissionKey: string
) {
  const { user } = useAuth();
  const [hasAccess, setHasAccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function checkPermission() {
      if (!user?.id || !eventId) {
        setHasAccess(false);
        setLoading(false);
        return;
      }

      try {
        const result = await hasEventPermission(user.id, eventId, permissionKey);
        setHasAccess(result);
      } catch (error) {
        console.error('Error checking event permission:', error);
        setHasAccess(false);
      } finally {
        setLoading(false);
      }
    }

    checkPermission();
  }, [user?.id, eventId, permissionKey]);

  return { hasAccess, loading };
}

/**
 * Hook to get all event permissions for user
 */
export function useEventPermissions(eventId: string | undefined) {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchPermissions() {
      if (!user?.id || !eventId) {
        setPermissions({});
        setLoading(false);
        return;
      }

      try {
        const perms = await getUserEventPermissions(user.id, eventId);
        setPermissions(perms);
      } catch (error) {
        console.error('Error fetching event permissions:', error);
        setPermissions({});
      } finally {
        setLoading(false);
      }
    }

    fetchPermissions();
  }, [user?.id, eventId]);

  return { permissions, loading };
}

/**
 * Hook to check multiple event permissions at once
 */
export function useMultipleEventPermissions(
  eventId: string | undefined,
  permissionKeys: string[]
) {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState<boolean>(true);
  
  const keysStr = JSON.stringify(permissionKeys);

  useEffect(() => {
    async function checkPermissions() {
      if (!user?.id || !eventId) {
        setPermissions({});
        setLoading(false);
        return;
      }

      try {
        const keys = JSON.parse(keysStr);
        const results = await checkMultipleEventPermissions(user.id, eventId, keys);
        setPermissions(results);
      } catch (error) {
        console.error('Error checking event permissions:', error);
        setPermissions({});
      } finally {
        setLoading(false);
      }
    }

    checkPermissions();
  }, [user?.id, eventId, keysStr]);

  return { permissions, loading };
}

/**
 * Hook to get event role definition
 */
export function useEventRoleDefinition(roleType: EventRoleType | null | undefined) {
  const [definition, setDefinition] = useState<EventRoleDefinition | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchDefinition() {
      if (!roleType) {
        setDefinition(null);
        setLoading(false);
        return;
      }

      try {
        const def = await getEventRoleDefinition(roleType);
        setDefinition(def);
      } catch (error) {
        console.error('Error fetching event role definition:', error);
        setDefinition(null);
      } finally {
        setLoading(false);
      }
    }

    fetchDefinition();
  }, [roleType]);

  return { definition, loading };
}

/**
 * Hook to get comprehensive event role info for user
 */
export function useUserEventRoleInfo(eventId: string | undefined) {
  const { eventRole, loading: roleLoading } = useEventRole(eventId);
  const { definition, loading: defLoading } = useEventRoleDefinition(eventRole);
  const { permissions, loading: permsLoading } = useEventPermissions(eventId);
  const { hasAssignment, loading: assignmentLoading } = useHasEventAssignment(eventId);

  return {
    eventRole,
    definition,
    permissions,
    hasAssignment,
    loading: roleLoading || defLoading || permsLoading || assignmentLoading
  };
}
