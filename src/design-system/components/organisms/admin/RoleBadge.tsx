'use client';

import { MemberRole, TeamRole } from '@/lib/rbac/types';
import { EventRoleType } from '@/lib/rbac/event-roles';
import styles from './RoleBadge.module.css';

interface RoleBadgeProps {
  role: MemberRole | TeamRole | EventRoleType | string;
  type?: 'member' | 'team' | 'event';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const MEMBER_ROLE_CLASSES: Record<MemberRole, string> = {
  [MemberRole.MEMBER]: styles.memberRole,
  [MemberRole.TRIAL_MEMBER]: styles.trialMemberRole,
  [MemberRole.ATTENDEE]: styles.attendeeRole,
  [MemberRole.GUEST]: styles.guestRole,
};

const TEAM_ROLE_CLASSES: Record<TeamRole, string> = {
  [TeamRole.LEGEND]: styles.legendRole,
  [TeamRole.SUPER_ADMIN]: styles.superAdminRole,
  [TeamRole.ADMIN]: styles.adminRole,
  [TeamRole.LEAD]: styles.leadRole,
  [TeamRole.TEAM]: styles.teamRole,
  [TeamRole.COLLABORATOR]: styles.collaboratorRole,
  [TeamRole.PARTNER]: styles.partnerRole,
  [TeamRole.AMBASSADOR]: styles.ambassadorRole,
};

const EVENT_ROLE_CLASSES: Record<EventRoleType, string> = {
  [EventRoleType.EVENT_LEAD]: styles.eventLeadRole,
  [EventRoleType.EVENT_STAFF]: styles.eventStaffRole,
  [EventRoleType.VENDOR]: styles.vendorRole,
  [EventRoleType.TALENT]: styles.talentRole,
  [EventRoleType.AGENT]: styles.agentRole,
  [EventRoleType.SPONSOR]: styles.sponsorRole,
  [EventRoleType.MEDIA]: styles.mediaRole,
  [EventRoleType.INVESTOR]: styles.investorRole,
  [EventRoleType.STAKEHOLDER]: styles.stakeholderRole,
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
  sm: styles.badgeSm,
  md: styles.badgeMd,
  lg: styles.badgeLg,
};

export function RoleBadge({ role, type, size = 'md', showIcon = true }: RoleBadgeProps) {
  const roleKey = role.toLowerCase();
  
  // Determine color scheme
  let roleClass = styles.guestRole;
  
  if (type === 'member' && roleKey in MEMBER_ROLE_CLASSES) {
    roleClass = MEMBER_ROLE_CLASSES[roleKey as MemberRole];
  } else if (type === 'team' && roleKey in TEAM_ROLE_CLASSES) {
    roleClass = TEAM_ROLE_CLASSES[roleKey as TeamRole];
  } else if (type === 'event' && roleKey in EVENT_ROLE_CLASSES) {
    roleClass = EVENT_ROLE_CLASSES[roleKey as EventRoleType];
  } else {
    // Auto-detect type
    if (roleKey in MEMBER_ROLE_CLASSES) {
      roleClass = MEMBER_ROLE_CLASSES[roleKey as MemberRole];
    } else if (roleKey in TEAM_ROLE_CLASSES) {
      roleClass = TEAM_ROLE_CLASSES[roleKey as TeamRole];
    } else if (roleKey in EVENT_ROLE_CLASSES) {
      roleClass = EVENT_ROLE_CLASSES[roleKey as EventRoleType];
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
      className={`${styles.badge} ${roleClass} ${SIZE_CLASSES[size]}`}
      title={`${type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Role'}: ${displayName}`}
    >
      {showIcon && icon && <span className={styles.icon}>{icon}</span>}
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
    <div className={styles.badgeContainer}>
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
