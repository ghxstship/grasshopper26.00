/**
 * RBAC React Hooks
 * Custom hooks for permission checking in React components
 */

'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import {
  hasPermission,
  isTeamMember,
  isLegend,
  isSuperAdmin,
  canManageEvent,
  canManageBrand,
  hasActiveMembership,
  hasEventTicket,
  getUserTeamRole,
  getUserMemberRole,
  checkMultiplePermissions
} from './permissions';
import {
  MemberRole,
  TeamRole,
  PermissionAction,
  ResourceType
} from './types';

/**
 * Hook to check if user has a specific permission
 */
export function usePermission(
  resourceName: string,
  action: PermissionAction,
  scopeContext?: Record<string, any>
) {
  const { user } = useAuth();
  const [hasAccess, setHasAccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Serialize scopeContext for stable dependency
  const scopeContextStr = scopeContext ? JSON.stringify(scopeContext) : null;

  useEffect(() => {
    async function checkPermission() {
      if (!user?.id) {
        setHasAccess(false);
        setLoading(false);
        return;
      }

      try {
        const parsedContext = scopeContextStr ? JSON.parse(scopeContextStr) : undefined;
        const result = await hasPermission(user.id, resourceName, action, parsedContext);
        setHasAccess(result);
      } catch (error) {
        console.error('Error checking permission:', error);
        setHasAccess(false);
      } finally {
        setLoading(false);
      }
    }

    checkPermission();
  }, [user?.id, resourceName, action, scopeContextStr]);

  return { hasAccess, loading };
}

/**
 * Hook to check multiple permissions at once
 */
export function usePermissions(
  checks: Array<{ resourceName: string; action: PermissionAction; scopeContext?: Record<string, any> }>
) {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState<boolean>(true);
  
  // Serialize checks for stable dependency
  const checksStr = JSON.stringify(checks);

  useEffect(() => {
    async function checkPermissions() {
      if (!user?.id) {
        setPermissions({});
        setLoading(false);
        return;
      }

      try {
        const parsedChecks = JSON.parse(checksStr);
        const results = await checkMultiplePermissions(user.id, parsedChecks);
        setPermissions(results);
      } catch (error) {
        console.error('Error checking permissions:', error);
        setPermissions({});
      } finally {
        setLoading(false);
      }
    }

    checkPermissions();
  }, [user?.id, checksStr]);

  return { permissions, loading };
}

/**
 * Hook to check if user is a team member
 */
export function useIsTeamMember() {
  const { user } = useAuth();
  const [isTeam, setIsTeam] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function checkTeamMember() {
      if (!user?.id) {
        setIsTeam(false);
        setLoading(false);
        return;
      }

      try {
        const result = await isTeamMember(user.id);
        setIsTeam(result);
      } catch (error) {
        console.error('Error checking team member status:', error);
        setIsTeam(false);
      } finally {
        setLoading(false);
      }
    }

    checkTeamMember();
  }, [user?.id]);

  return { isTeam, loading };
}

/**
 * Hook to check if user is legend
 */
export function useIsLegend() {
  const { user } = useAuth();
  const [isLegendUser, setIsLegendUser] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function checkLegend() {
      if (!user?.id) {
        setIsLegendUser(false);
        setLoading(false);
        return;
      }

      try {
        const result = await isLegend(user.id);
        setIsLegendUser(result);
      } catch (error) {
        console.error('Error checking legend status:', error);
        setIsLegendUser(false);
      } finally {
        setLoading(false);
      }
    }

    checkLegend();
  }, [user?.id]);

  return { isLegendUser, loading };
}

/**
 * Hook to check if user is super admin
 */
export function useIsSuperAdmin() {
  const { user } = useAuth();
  const [isSuperAdminUser, setIsSuperAdminUser] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function checkSuperAdmin() {
      if (!user?.id) {
        setIsSuperAdminUser(false);
        setLoading(false);
        return;
      }

      try {
        const result = await isSuperAdmin(user.id);
        setIsSuperAdminUser(result);
      } catch (error) {
        console.error('Error checking super admin status:', error);
        setIsSuperAdminUser(false);
      } finally {
        setLoading(false);
      }
    }

    checkSuperAdmin();
  }, [user?.id]);

  return { isSuperAdminUser, loading };
}

/**
 * Hook to check if user can manage an event
 */
export function useCanManageEvent(eventId: string | undefined) {
  const { user } = useAuth();
  const [canManage, setCanManage] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function checkEventManagement() {
      if (!user?.id || !eventId) {
        setCanManage(false);
        setLoading(false);
        return;
      }

      try {
        const result = await canManageEvent(user.id, eventId);
        setCanManage(result);
      } catch (error) {
        console.error('Error checking event management permission:', error);
        setCanManage(false);
      } finally {
        setLoading(false);
      }
    }

    checkEventManagement();
  }, [user?.id, eventId]);

  return { canManage, loading };
}

/**
 * Hook to check if user can manage a brand
 */
export function useCanManageBrand(brandId: string | undefined) {
  const { user } = useAuth();
  const [canManage, setCanManage] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function checkBrandManagement() {
      if (!user?.id || !brandId) {
        setCanManage(false);
        setLoading(false);
        return;
      }

      try {
        const result = await canManageBrand(user.id, brandId);
        setCanManage(result);
      } catch (error) {
        console.error('Error checking brand management permission:', error);
        setCanManage(false);
      } finally {
        setLoading(false);
      }
    }

    checkBrandManagement();
  }, [user?.id, brandId]);

  return { canManage, loading };
}

/**
 * Hook to check if user has active membership
 */
export function useHasActiveMembership() {
  const { user } = useAuth();
  const [hasMembership, setHasMembership] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function checkMembership() {
      if (!user?.id) {
        setHasMembership(false);
        setLoading(false);
        return;
      }

      try {
        const result = await hasActiveMembership(user.id);
        setHasMembership(result);
      } catch (error) {
        console.error('Error checking membership status:', error);
        setHasMembership(false);
      } finally {
        setLoading(false);
      }
    }

    checkMembership();
  }, [user?.id]);

  return { hasMembership, loading };
}

/**
 * Hook to check if user has ticket for event
 */
export function useHasEventTicket(eventId: string | undefined) {
  const { user } = useAuth();
  const [hasTicket, setHasTicket] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function checkTicket() {
      if (!user?.id || !eventId) {
        setHasTicket(false);
        setLoading(false);
        return;
      }

      try {
        const result = await hasEventTicket(user.id, eventId);
        setHasTicket(result);
      } catch (error) {
        console.error('Error checking event ticket:', error);
        setHasTicket(false);
      } finally {
        setLoading(false);
      }
    }

    checkTicket();
  }, [user?.id, eventId]);

  return { hasTicket, loading };
}

/**
 * Hook to get user's team role
 */
export function useTeamRole() {
  const { user } = useAuth();
  const [teamRole, setTeamRole] = useState<TeamRole | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchTeamRole() {
      if (!user?.id) {
        setTeamRole(null);
        setLoading(false);
        return;
      }

      try {
        const result = await getUserTeamRole(user.id);
        setTeamRole(result);
      } catch (error) {
        console.error('Error fetching team role:', error);
        setTeamRole(null);
      } finally {
        setLoading(false);
      }
    }

    fetchTeamRole();
  }, [user?.id]);

  return { teamRole, loading };
}

/**
 * Hook to get user's member role
 */
export function useMemberRole() {
  const { user } = useAuth();
  const [memberRole, setMemberRole] = useState<MemberRole>(MemberRole.GUEST);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchMemberRole() {
      if (!user?.id) {
        setMemberRole(MemberRole.GUEST);
        setLoading(false);
        return;
      }

      try {
        const result = await getUserMemberRole(user.id);
        setMemberRole(result);
      } catch (error) {
        console.error('Error fetching member role:', error);
        setMemberRole(MemberRole.GUEST);
      } finally {
        setLoading(false);
      }
    }

    fetchMemberRole();
  }, [user?.id]);

  return { memberRole, loading };
}

/**
 * Hook to get comprehensive user role information
 */
export function useUserRoles() {
  const { teamRole, loading: teamLoading } = useTeamRole();
  const { memberRole, loading: memberLoading } = useMemberRole();
  const { isTeam, loading: teamMemberLoading } = useIsTeamMember();

  return {
    teamRole,
    memberRole,
    isTeamMember: isTeam,
    loading: teamLoading || memberLoading || teamMemberLoading
  };
}
