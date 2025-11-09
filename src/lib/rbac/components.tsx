/**
 * RBAC React Components
 * Permission-based rendering components
 */

'use client';

import { ReactNode } from 'react';
import {
  usePermission,
  useIsTeamMember,
  useIsSuperAdmin,
  useCanManageEvent,
  useCanManageBrand
} from './hooks';
import { PermissionAction } from './types';

interface PermissionGateProps {
  children: ReactNode;
  resourceName: string;
  action: PermissionAction;
  scopeContext?: Record<string, any>;
  fallback?: ReactNode;
  loadingFallback?: ReactNode;
}

/**
 * Component that renders children only if user has permission
 */
export function PermissionGate({
  children,
  resourceName,
  action,
  scopeContext,
  fallback = null,
  loadingFallback = null
}: PermissionGateProps) {
  const { hasAccess, loading } = usePermission(resourceName, action, scopeContext);

  if (loading) {
    return <>{loadingFallback}</>;
  }

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface TeamMemberGateProps {
  children: ReactNode;
  fallback?: ReactNode;
  loadingFallback?: ReactNode;
}

/**
 * Component that renders children only if user is a team member
 */
export function TeamMemberGate({
  children,
  fallback = null,
  loadingFallback = null
}: TeamMemberGateProps) {
  const { isTeam, loading } = useIsTeamMember();

  if (loading) {
    return <>{loadingFallback}</>;
  }

  if (!isTeam) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface SuperAdminGateProps {
  children: ReactNode;
  fallback?: ReactNode;
  loadingFallback?: ReactNode;
}

/**
 * Component that renders children only if user is super admin
 */
export function SuperAdminGate({
  children,
  fallback = null,
  loadingFallback = null
}: SuperAdminGateProps) {
  const { isSuperAdminUser, loading } = useIsSuperAdmin();

  if (loading) {
    return <>{loadingFallback}</>;
  }

  if (!isSuperAdminUser) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface EventManagerGateProps {
  children: ReactNode;
  eventId: string;
  fallback?: ReactNode;
  loadingFallback?: ReactNode;
}

/**
 * Component that renders children only if user can manage the event
 */
export function EventManagerGate({
  children,
  eventId,
  fallback = null,
  loadingFallback = null
}: EventManagerGateProps) {
  const { canManage, loading } = useCanManageEvent(eventId);

  if (loading) {
    return <>{loadingFallback}</>;
  }

  if (!canManage) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface BrandManagerGateProps {
  children: ReactNode;
  brandId: string;
  fallback?: ReactNode;
  loadingFallback?: ReactNode;
}

/**
 * Component that renders children only if user can manage the brand
 */
export function BrandManagerGate({
  children,
  brandId,
  fallback = null,
  loadingFallback = null
}: BrandManagerGateProps) {
  const { canManage, loading } = useCanManageBrand(brandId);

  if (loading) {
    return <>{loadingFallback}</>;
  }

  if (!canManage) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
