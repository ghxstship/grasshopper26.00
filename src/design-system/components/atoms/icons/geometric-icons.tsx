/**
 * GHXSTSHIP Geometric Icon Library
 * All icons are geometric shapes - NO soft curves
 */

import { cn } from '@/lib/utils';

interface IconProps {
  size?: number;
  className?: string;
}

/**
 * Ticket icon (geometric outline)
 */
export function TicketIcon({ size = 24, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={cn('stroke-current', className)}
    >
      <rect x="2" y="6" width="20" height="12" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <line x1="8" y1="6" x2="8" y2="18" strokeDasharray="2 2" />
    </svg>
  );
}

/**
 * VIP upgrade icon (upward triangle)
 */
export function VipUpgradeIcon({ size = 24, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={cn('stroke-current', className)}
    >
      <polygon points="12,4 20,20 4,20" />
      <line x1="8" y1="16" x2="16" y2="16" />
    </svg>
  );
}

/**
 * Early access icon (geometric clock)
 */
export function EarlyAccessIcon({ size = 24, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={cn('stroke-current', className)}
    >
      <rect x="3" y="3" width="18" height="18" />
      <line x1="12" y1="7" x2="12" y2="12" />
      <line x1="12" y1="12" x2="16" y2="12" />
    </svg>
  );
}

/**
 * Discount icon (geometric percentage)
 */
export function DiscountIcon({ size = 24, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={cn('stroke-current', className)}
    >
      <line x1="5" y1="19" x2="19" y2="5" />
      <rect x="4" y="4" width="4" height="4" />
      <rect x="16" y="16" width="4" height="4" />
    </svg>
  );
}

/**
 * Member lounge icon (geometric doorway)
 */
export function MemberLoungeIcon({ size = 24, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={cn('stroke-current', className)}
    >
      <rect x="6" y="4" width="12" height="16" />
      <rect x="10" y="12" width="1" height="4" />
      <line x1="4" y1="20" x2="20" y2="20" />
    </svg>
  );
}

/**
 * Meet & greet icon (overlapping shapes)
 */
export function MeetGreetIcon({ size = 24, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={cn('stroke-current', className)}
    >
      <rect x="4" y="6" width="8" height="12" />
      <rect x="12" y="6" width="8" height="12" />
    </svg>
  );
}

/**
 * Navigation arrow right (bold triangle)
 */
export function ArrowRightIcon({ size = 24, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn('fill-current', className)}
    >
      <polygon points="8,4 20,12 8,20" />
    </svg>
  );
}

/**
 * Navigation arrow left (bold triangle)
 */
export function ArrowLeftIcon({ size = 24, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn('fill-current', className)}
    >
      <polygon points="16,4 4,12 16,20" />
    </svg>
  );
}

/**
 * Navigation arrow up (bold triangle)
 */
export function ArrowUpIcon({ size = 24, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn('fill-current', className)}
    >
      <polygon points="4,16 12,4 20,16" />
    </svg>
  );
}

/**
 * Navigation arrow down (bold triangle)
 */
export function ArrowDownIcon({ size = 24, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn('fill-current', className)}
    >
      <polygon points="4,8 12,20 20,8" />
    </svg>
  );
}

/**
 * Close icon (geometric X)
 */
export function CloseIcon({ size = 24, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      className={cn('stroke-current', className)}
    >
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="18" y1="6" x2="6" y2="18" />
    </svg>
  );
}

/**
 * Check icon (geometric checkmark)
 */
export function CheckIcon({ size = 24, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      className={cn('stroke-current', className)}
    >
      <polyline points="6,12 10,16 18,8" />
    </svg>
  );
}

/**
 * Plus icon (geometric plus)
 */
export function PlusIcon({ size = 24, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      className={cn('stroke-current', className)}
    >
      <line x1="12" y1="6" x2="12" y2="18" />
      <line x1="6" y1="12" x2="18" y2="12" />
    </svg>
  );
}

/**
 * Minus icon (geometric minus)
 */
export function MinusIcon({ size = 24, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      className={cn('stroke-current', className)}
    >
      <line x1="6" y1="12" x2="18" y2="12" />
    </svg>
  );
}

/**
 * Menu icon (geometric hamburger)
 */
export function MenuIcon({ size = 24, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      className={cn('stroke-current', className)}
    >
      <line x1="4" y1="7" x2="20" y2="7" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="17" x2="20" y2="17" />
    </svg>
  );
}

/**
 * Search icon (geometric magnifying glass)
 */
export function SearchIcon({ size = 24, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={cn('stroke-current', className)}
    >
      <rect x="4" y="4" width="12" height="12" />
      <line x1="14" y1="14" x2="20" y2="20" strokeWidth="3" />
    </svg>
  );
}

/**
 * User icon (geometric person)
 */
export function UserIcon({ size = 24, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={cn('stroke-current', className)}
    >
      <rect x="8" y="4" width="8" height="6" />
      <polygon points="6,20 12,14 18,20" />
    </svg>
  );
}

/**
 * Settings icon (geometric gear)
 */
export function SettingsIcon({ size = 24, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={cn('stroke-current', className)}
    >
      <rect x="8" y="8" width="8" height="8" />
      <line x1="12" y1="4" x2="12" y2="8" />
      <line x1="12" y1="16" x2="12" y2="20" />
      <line x1="4" y1="12" x2="8" y2="12" />
      <line x1="16" y1="12" x2="20" y2="12" />
    </svg>
  );
}

/**
 * Calendar icon (geometric calendar)
 */
export function CalendarIcon({ size = 24, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={cn('stroke-current', className)}
    >
      <rect x="4" y="6" width="16" height="14" />
      <line x1="4" y1="10" x2="20" y2="10" />
      <line x1="8" y1="4" x2="8" y2="8" />
      <line x1="16" y1="4" x2="16" y2="8" />
    </svg>
  );
}

/**
 * Location icon (geometric pin)
 */
export function LocationIcon({ size = 24, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={cn('stroke-current', className)}
    >
      <polygon points="12,4 16,10 12,20 8,10" />
      <rect x="10" y="8" width="4" height="4" />
    </svg>
  );
}

/**
 * Star icon (geometric star - tier badge)
 */
export function StarIcon({ size = 24, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn('fill-current', className)}
    >
      <polygon points="12,2 15,9 22,10 17,15 18,22 12,18 6,22 7,15 2,10 9,9" />
    </svg>
  );
}

/**
 * Crown icon (geometric crown - First Class tier)
 */
export function CrownIcon({ size = 24, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn('fill-current', className)}
    >
      <polygon points="4,18 4,10 8,14 12,8 16,14 20,10 20,18" />
      <rect x="4" y="18" width="16" height="2" />
    </svg>
  );
}

/**
 * Briefcase icon (geometric briefcase - Business tier)
 */
export function BriefcaseIcon({ size = 24, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={cn('stroke-current', className)}
    >
      <rect x="4" y="8" width="16" height="12" />
      <rect x="9" y="4" width="6" height="4" />
      <line x1="4" y1="12" x2="20" y2="12" />
    </svg>
  );
}
