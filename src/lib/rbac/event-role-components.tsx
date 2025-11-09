/**
 * Event-Specific Role React Components
 * Permission-based rendering components for event roles
 */

'use client';

import { ReactNode } from 'react';
import {
  useEventPermission,
  useHasEventAssignment,
  useEventRole
} from './event-role-hooks';
import { EventRoleType } from './event-roles';

interface EventPermissionGateProps {
  children: ReactNode;
  eventId: string;
  permissionKey: string;
  fallback?: ReactNode;
  loadingFallback?: ReactNode;
}

/**
 * Component that renders children only if user has event permission
 */
export function EventPermissionGate({
  children,
  eventId,
  permissionKey,
  fallback = null,
  loadingFallback = null
}: EventPermissionGateProps) {
  const { hasAccess, loading } = useEventPermission(eventId, permissionKey);

  if (loading) {
    return <>{loadingFallback}</>;
  }

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface EventAssignmentGateProps {
  children: ReactNode;
  eventId: string;
  fallback?: ReactNode;
  loadingFallback?: ReactNode;
}

/**
 * Component that renders children only if user has active event assignment
 */
export function EventAssignmentGate({
  children,
  eventId,
  fallback = null,
  loadingFallback = null
}: EventAssignmentGateProps) {
  const { hasAssignment, loading } = useHasEventAssignment(eventId);

  if (loading) {
    return <>{loadingFallback}</>;
  }

  if (!hasAssignment) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface EventRoleGateProps {
  children: ReactNode;
  eventId: string;
  allowedRoles: EventRoleType[];
  fallback?: ReactNode;
  loadingFallback?: ReactNode;
}

/**
 * Component that renders children only if user has one of the allowed event roles
 */
export function EventRoleGate({
  children,
  eventId,
  allowedRoles,
  fallback = null,
  loadingFallback = null
}: EventRoleGateProps) {
  const { eventRole, loading } = useEventRole(eventId);

  if (loading) {
    return <>{loadingFallback}</>;
  }

  if (!eventRole || !allowedRoles.includes(eventRole)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface EventLeadGateProps {
  children: ReactNode;
  eventId: string;
  fallback?: ReactNode;
  loadingFallback?: ReactNode;
}

/**
 * Component that renders children only if user is event lead
 */
export function EventLeadGate({
  children,
  eventId,
  fallback = null,
  loadingFallback = null
}: EventLeadGateProps) {
  return (
    <EventRoleGate
      eventId={eventId}
      allowedRoles={[EventRoleType.EVENT_LEAD]}
      fallback={fallback}
      loadingFallback={loadingFallback}
    >
      {children}
    </EventRoleGate>
  );
}

interface EventStaffGateProps {
  children: ReactNode;
  eventId: string;
  fallback?: ReactNode;
  loadingFallback?: ReactNode;
}

/**
 * Component that renders children only if user is event staff or lead
 */
export function EventStaffGate({
  children,
  eventId,
  fallback = null,
  loadingFallback = null
}: EventStaffGateProps) {
  return (
    <EventRoleGate
      eventId={eventId}
      allowedRoles={[EventRoleType.EVENT_LEAD, EventRoleType.EVENT_STAFF]}
      fallback={fallback}
      loadingFallback={loadingFallback}
    >
      {children}
    </EventRoleGate>
  );
}

interface EventVendorGateProps {
  children: ReactNode;
  eventId: string;
  fallback?: ReactNode;
  loadingFallback?: ReactNode;
}

/**
 * Component that renders children only if user is vendor
 */
export function EventVendorGate({
  children,
  eventId,
  fallback = null,
  loadingFallback = null
}: EventVendorGateProps) {
  return (
    <EventRoleGate
      eventId={eventId}
      allowedRoles={[EventRoleType.VENDOR]}
      fallback={fallback}
      loadingFallback={loadingFallback}
    >
      {children}
    </EventRoleGate>
  );
}

interface EventTalentGateProps {
  children: ReactNode;
  eventId: string;
  fallback?: ReactNode;
  loadingFallback?: ReactNode;
}

/**
 * Component that renders children only if user is talent or agent
 */
export function EventTalentGate({
  children,
  eventId,
  fallback = null,
  loadingFallback = null
}: EventTalentGateProps) {
  return (
    <EventRoleGate
      eventId={eventId}
      allowedRoles={[EventRoleType.TALENT, EventRoleType.AGENT]}
      fallback={fallback}
      loadingFallback={loadingFallback}
    >
      {children}
    </EventRoleGate>
  );
}

interface EventSponsorGateProps {
  children: ReactNode;
  eventId: string;
  fallback?: ReactNode;
  loadingFallback?: ReactNode;
}

/**
 * Component that renders children only if user is sponsor
 */
export function EventSponsorGate({
  children,
  eventId,
  fallback = null,
  loadingFallback = null
}: EventSponsorGateProps) {
  return (
    <EventRoleGate
      eventId={eventId}
      allowedRoles={[EventRoleType.SPONSOR]}
      fallback={fallback}
      loadingFallback={loadingFallback}
    >
      {children}
    </EventRoleGate>
  );
}

interface EventMediaGateProps {
  children: ReactNode;
  eventId: string;
  fallback?: ReactNode;
  loadingFallback?: ReactNode;
}

/**
 * Component that renders children only if user is media
 */
export function EventMediaGate({
  children,
  eventId,
  fallback = null,
  loadingFallback = null
}: EventMediaGateProps) {
  return (
    <EventRoleGate
      eventId={eventId}
      allowedRoles={[EventRoleType.MEDIA]}
      fallback={fallback}
      loadingFallback={loadingFallback}
    >
      {children}
    </EventRoleGate>
  );
}
