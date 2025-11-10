/**
 * Icon Component
 * GHXSTSHIP Entertainment Platform - Geometric icon system
 * Bold geometric icons for entertainment features
 */

import * as React from "react"
import styles from "./Icon.module.css"

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type IconColor = 'primary' | 'secondary' | 'tertiary' | 'inverse' | 'brand' | 'accent' | 'error' | 'success';

export interface IconProps extends React.SVGAttributes<SVGElement> {
  /** Icon size */
  size?: IconSize;
  
  /** Icon color */
  color?: IconColor;
  
  /** Custom className */
  className?: string;
  
  /** Children (SVG paths) */
  children: React.ReactNode;
  
  /** ARIA label */
  'aria-label'?: string;
  
  /** Decorative icon (hidden from screen readers) */
  decorative?: boolean;
}

export const Icon: React.FC<IconProps> = ({
  size = 'md',
  color = 'primary',
  className = '',
  children,
  'aria-label': ariaLabel,
  decorative = false,
  ...props
}) => {
  const classNames = [
    styles.icon,
    styles[size],
    styles[`color-${color}`],
    className,
  ].filter(Boolean).join(' ');
  
  return (
    <svg
      className={classNames}
      fill="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-label={ariaLabel}
      aria-hidden={decorative ? 'true' : undefined}
      role={decorative ? 'presentation' : 'img'}
      {...props}
    >
      {children}
    </svg>
  );
};

// Geometric GHXSTSHIP Icons
export const TicketIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <path d="M2 6h20v3h-2v-1H4v1H2V6zm0 5h2v2H2v-2zm20 0h-2v2h2v-2zM2 15h2v3h16v-3h2v5H2v-5z" />
  </Icon>
);

export const VIPIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.5L19 8v8l-7 3.5L5 16V8l7-3.5z" />
    <path d="M12 9l-3 6h2l1-2 1 2h2l-3-6z" />
  </Icon>
);

export const EarlyAccessIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8z" />
    <path d="M13 7h-2v6h6v-2h-4V7z" />
  </Icon>
);

export const DiscountIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <path d="M7 4L3 8l4 4 4-4-4-4zm10 8l-4 4 4 4 4-4-4-4zM7 14l-2 2 2 2 2-2-2-2zm10-4l-2-2-2 2 2 2 2-2z" />
  </Icon>
);

export const MemberLoungeIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <path d="M4 4h16v3H4V4zm0 5h16v11H4V9zm2 2v7h12v-7H6z" />
  </Icon>
);

export const MeetGreetIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <path d="M9 2C6.8 2 5 3.8 5 6s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm6-6c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM9 12c-3.3 0-6 2.7-6 6v4h12v-4c0-3.3-2.7-6-6-6zm-4 8v-2c0-2.2 1.8-4 4-4s4 1.8 4 4v2H5zm14 0v-2c0-2.2 1.8-4 4-4s4 1.8 4 4v2h-8z" />
  </Icon>
);

export const ArrowRightIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <path d="M8 4l8 8-8 8V4z" />
  </Icon>
);

export const ArrowLeftIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <path d="M16 4l-8 8 8 8V4z" />
  </Icon>
);

export const ArrowUpIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <path d="M4 16l8-8 8 8H4z" />
  </Icon>
);

export const ArrowDownIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <path d="M4 8l8 8 8-8H4z" />
  </Icon>
);

export const MinusIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <path d="M4 12h16" stroke="currentColor" strokeWidth="3" fill="none" />
  </Icon>
);

export const PlusIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <path d="M12 4v16M4 12h16" stroke="currentColor" strokeWidth="3" fill="none" />
  </Icon>
);

export const CloseIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="3" fill="none" />
  </Icon>
);

export const CheckIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <path d="M4 12l6 6L20 6" stroke="currentColor" strokeWidth="3" fill="none" />
  </Icon>
);

export const MenuIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <path d="M3 6h18v3H3V6zm0 6h18v3H3v-3zm0 6h18v3H3v-3z" />
  </Icon>
);

export const SearchIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <path d="M10 2c-4.4 0-8 3.6-8 8s3.6 8 8 8c1.8 0 3.5-.6 4.9-1.7l5.4 5.4 2.1-2.1-5.4-5.4C18.4 13.5 19 11.8 19 10c0-4.4-3.6-8-8-8zm0 14c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6z" />
  </Icon>
);

export const CartIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <path d="M7 4h14l-2 10H9L7 4zM6 2L4 14h14l3-14H6zM9 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
  </Icon>
);

export const UserIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <path d="M12 2C9.8 2 8 3.8 8 6s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm0 4c-4.4 0-8 2.7-8 6v4h16v-4c0-3.3-3.6-6-8-6zm-6 8v-2c0-2.2 2.7-4 6-4s6 1.8 6 4v2H6z" />
  </Icon>
);

export const HeartIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <path d="M12 21l-1.5-1.4C5.4 15.4 2 12.3 2 8.5 2 5.4 4.4 3 7.5 3c1.7 0 3.4.8 4.5 2.1C13.1 3.8 14.8 3 16.5 3 19.6 3 22 5.4 22 8.5c0 3.8-3.4 6.9-8.5 11.1L12 21z" />
  </Icon>
);

export const StarIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8-6.2-3.3-6.2 3.3 1.2-6.8-5-4.9 6.9-1L12 2z" />
  </Icon>
);

export const CalendarIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <path d="M7 2v2H5v18h14V4h-2V2h-3v2H10V2H7zm-2 4h14v14H5V6zm2 3v3h3V9H7zm5 0v3h3V9h-3zm5 0v3h3V9h-3zM7 14v3h3v-3H7zm5 0v3h3v-3h-3zm5 0v3h3v-3h-3z" />
  </Icon>
);

export const LocationIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <path d="M12 2C8.1 2 5 5.1 5 9c0 5.3 7 13 7 13s7-7.7 7-13c0-3.9-3.1-7-7-7zm0 9.5c-1.4 0-2.5-1.1-2.5-2.5S10.6 6.5 12 6.5s2.5 1.1 2.5 2.5-1.1 2.5-2.5 2.5z" />
  </Icon>
);

export const InfoIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8zm-1-13h2v2h-2V7zm0 4h2v6h-2v-6z" />
  </Icon>
);

export const WarningIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <path d="M2 20h20L12 4 2 20zm11-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
  </Icon>
);

export const ErrorIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8zm-1-13h2v6h-2V7zm0 8h2v2h-2v-2z" />
  </Icon>
);

export const SuccessIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8zm-2-13l-3 3 5 5 7-7-3-3-4 4-2-2z" />
  </Icon>
);

export const MusicIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <path d="M9 3v12c0 1.7-1.3 3-3 3s-3-1.3-3-3 1.3-3 3-3c.5 0 1 .1 1.4.3V3h11v6h-2V5H9zm-3 12c-.6 0-1 .4-1 1s.4 1 1 1 1-.4 1-1-.4-1-1-1zm12-6v6c0 1.7-1.3 3-3 3s-3-1.3-3-3 1.3-3 3-3c.5 0 1 .1 1.4.3V9h2zm-3 6c-.6 0-1 .4-1 1s.4 1 1 1 1-.4 1-1-.4-1-1-1z" />
  </Icon>
);

export const LineupIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <path d="M3 4h18v3H3V4zm0 5h18v3H3V9zm0 5h18v3H3v-3zm0 5h18v3H3v-3z" />
  </Icon>
);

export const StageIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <path d="M2 18h20v4H2v-4zm2-2h16l-2-8H6l-2 8zm1-6h14l1 4H5l1-4zM8 4h8v2H8V4z" />
  </Icon>
);

export const FilterIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <path d="M3 6h18v3H3V6zm2 5h14v3H5v-3zm3 5h8v3H8v-3z" />
  </Icon>
);

export const ShareIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <path d="M18 16c-1.1 0-2.1.5-2.8 1.2l-6.4-3.7c.1-.3.2-.6.2-1s-.1-.7-.2-1l6.4-3.7C15.9 8.5 16.9 9 18 9c2.2 0 4-1.8 4-4s-1.8-4-4-4-4 1.8-4 4c0 .4.1.7.2 1L7.8 9.7C7.1 9 6.1 8.5 5 8.5c-2.2 0-4 1.8-4 4s1.8 4 4 4c1.1 0 2.1-.5 2.8-1.2l6.4 3.7c-.1.3-.2.6-.2 1 0 2.2 1.8 4 4 4s4-1.8 4-4-1.8-4-4-4zm0-12c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zM5 14.5c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm13 5.5c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
  </Icon>
);
