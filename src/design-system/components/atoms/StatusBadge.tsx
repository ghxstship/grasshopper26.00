import React from 'react';
import { cn } from '@/lib/utils';

export type AdvanceStatus = 
  | 'draft' 
  | 'submitted' 
  | 'under_review' 
  | 'approved' 
  | 'rejected' 
  | 'fulfilled' 
  | 'cancelled';

export type FulfillmentStatus = 
  | 'pending' 
  | 'assigned' 
  | 'fulfilled' 
  | 'unavailable';

interface StatusBadgeProps {
  status: AdvanceStatus | FulfillmentStatus;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const statusConfig: Record<string, { label: string; styles: string }> = {
  draft: {
    label: 'DRAFT',
    styles: 'bg-grey-300 text-black border-grey-600',
  },
  submitted: {
    label: 'SUBMITTED',
    styles: 'bg-grey-800 text-white border-black',
  },
  under_review: {
    label: 'UNDER REVIEW',
    styles: 'bg-grey-800 text-white border-black',
  },
  approved: {
    label: 'APPROVED',
    styles: 'bg-black text-white border-black',
  },
  rejected: {
    label: 'REJECTED',
    styles: 'bg-white text-black border-black',
  },
  fulfilled: {
    label: 'FULFILLED',
    styles: 'bg-grey-900 text-white border-grey-900',
  },
  cancelled: {
    label: 'CANCELLED',
    styles: 'bg-grey-400 text-black border-black',
  },
  pending: {
    label: 'PENDING',
    styles: 'bg-grey-300 text-black border-grey-600',
  },
  assigned: {
    label: 'ASSIGNED',
    styles: 'bg-grey-800 text-white border-black',
  },
  unavailable: {
    label: 'UNAVAILABLE',
    styles: 'bg-grey-400 text-black border-black',
  },
};

const sizeClasses = {
  sm: 'px-2 py-1 text-[10px]',
  md: 'px-3 py-2 text-xs',
  lg: 'px-4 py-3 text-sm',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  size = 'md',
  className 
}) => {
  const config = statusConfig[status] || statusConfig.draft;

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center',
        'border-2 font-bebas-neue uppercase tracking-wide',
        'transition-all duration-200',
        config.styles,
        sizeClasses[size],
        className
      )}
    >
      {config.label}
    </span>
  );
};
