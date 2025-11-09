'use client';

import { MemberRole, TeamRole } from '@/lib/rbac/types';
import { EventRoleType } from '@/lib/rbac/event-roles';

interface RoleBadgeProps {
  role: MemberRole | TeamRole | EventRoleType | string;
  type?: 'member' | 'team' | 'event';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const MEMBER_ROLE_COLORS: Record<MemberRole, string> = {
  [MemberRole.MEMBER]: 'bg-purple-100 text-purple-800 border-purple-200',
  [MemberRole.TRIAL_MEMBER]: 'bg-blue-100 text-blue-800 border-blue-200',
  [MemberRole.ATTENDEE]: 'bg-green-100 text-green-800 border-green-200',
  [MemberRole.GUEST]: 'bg-gray-100 text-gray-800 border-gray-200',
};

const TEAM_ROLE_COLORS: Record<TeamRole, string> = {
  [TeamRole.LEGEND]: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-yellow-500',
  [TeamRole.SUPER_ADMIN]: 'bg-red-100 text-red-800 border-red-200',
  [TeamRole.ADMIN]: 'bg-orange-100 text-orange-800 border-orange-200',
  [TeamRole.LEAD]: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  [TeamRole.TEAM]: 'bg-blue-100 text-blue-800 border-blue-200',
  [TeamRole.COLLABORATOR]: 'bg-teal-100 text-teal-800 border-teal-200',
  [TeamRole.PARTNER]: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  [TeamRole.AMBASSADOR]: 'bg-pink-100 text-pink-800 border-pink-200',
};

const EVENT_ROLE_COLORS: Record<EventRoleType, string> = {
  [EventRoleType.EVENT_LEAD]: 'bg-purple-100 text-purple-800 border-purple-200',
  [EventRoleType.EVENT_STAFF]: 'bg-green-100 text-green-800 border-green-200',
  [EventRoleType.VENDOR]: 'bg-amber-100 text-amber-800 border-amber-200',
  [EventRoleType.TALENT]: 'bg-pink-100 text-pink-800 border-pink-200',
  [EventRoleType.AGENT]: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  [EventRoleType.SPONSOR]: 'bg-blue-100 text-blue-800 border-blue-200',
  [EventRoleType.MEDIA]: 'bg-red-100 text-red-800 border-red-200',
  [EventRoleType.INVESTOR]: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  [EventRoleType.STAKEHOLDER]: 'bg-slate-100 text-slate-800 border-slate-200',
};

const ROLE_ICONS: Record<string, string> = {
  // Member roles
  member: '👑',
  trial_member: '🎯',
  attendee: '🎫',
  guest: '👤',
  
  // Team roles
  legend: '⚡',
  super_admin: '🔱',
  admin: '🛡️',
  lead: '⭐',
  team: '👥',
  collaborator: '🤝',
  partner: '🔗',
  ambassador: '📣',
  
  // Event roles
  event_lead: '🎬',
  event_staff: '✅',
  vendor: '💼',
  talent: '🎤',
  agent: '👔',
  sponsor: '🏆',
  media: '📸',
  investor: '📈',
  stakeholder: '👁️',
};

const SIZE_CLASSES = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-3 py-1',
  lg: 'text-base px-4 py-1.5',
};

export function RoleBadge({ role, type, size = 'md', showIcon = true }: RoleBadgeProps) {
  const roleKey = role.toLowerCase();
  
  // Determine color scheme
  let colorClass = 'bg-gray-100 text-gray-800 border-gray-200';
  
  if (type === 'member' && roleKey in MEMBER_ROLE_COLORS) {
    colorClass = MEMBER_ROLE_COLORS[roleKey as MemberRole];
  } else if (type === 'team' && roleKey in TEAM_ROLE_COLORS) {
    colorClass = TEAM_ROLE_COLORS[roleKey as TeamRole];
  } else if (type === 'event' && roleKey in EVENT_ROLE_COLORS) {
    colorClass = EVENT_ROLE_COLORS[roleKey as EventRoleType];
  } else {
    // Auto-detect type
    if (roleKey in MEMBER_ROLE_COLORS) {
      colorClass = MEMBER_ROLE_COLORS[roleKey as MemberRole];
    } else if (roleKey in TEAM_ROLE_COLORS) {
      colorClass = TEAM_ROLE_COLORS[roleKey as TeamRole];
    } else if (roleKey in EVENT_ROLE_COLORS) {
      colorClass = EVENT_ROLE_COLORS[roleKey as EventRoleType];
    }
  }

  // Format display name
  const displayName = role
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const icon = ROLE_ICONS[roleKey];

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${colorClass} ${SIZE_CLASSES[size]}`}
      title={`${type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Role'}: ${displayName}`}
    >
      {showIcon && icon && <span className="leading-none">{icon}</span>}
      <span>{displayName}</span>
    </span>
  );
}

interface MultiRoleBadgeProps {
  memberRole?: MemberRole | null;
  teamRole?: TeamRole | null;
  eventRole?: EventRoleType | null;
  size?: 'sm' | 'md' | 'lg';
  showIcons?: boolean;
}

export function MultiRoleBadge({
  memberRole,
  teamRole,
  eventRole,
  size = 'sm',
  showIcons = true
}: MultiRoleBadgeProps) {
  const roles = [
    memberRole && { role: memberRole, type: 'member' as const },
    teamRole && { role: teamRole, type: 'team' as const },
    eventRole && { role: eventRole, type: 'event' as const },
  ].filter(Boolean);

  if (roles.length === 0) {
    return (
      <RoleBadge
        role={MemberRole.GUEST}
        type="member"
        size={size}
        showIcon={showIcons}
      />
    );
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {roles.map((r, index) => r && (
        <RoleBadge
          key={index}
          role={r.role}
          type={r.type}
          size={size}
          showIcon={showIcons}
        />
      ))}
    </div>
  );
}
