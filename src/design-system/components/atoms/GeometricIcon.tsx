import React from 'react';
import { cn } from '@/lib/utils';
import {
  BadgeCheck,
  Sliders,
  Speaker,
  UtensilsCrossed,
  Plane,
  Star,
  ShoppingCart,
  Check,
  X,
  ChevronRight,
  Plus,
  Minus,
  Edit,
  Trash2,
  ClipboardList,
  Package,
  Calendar,
  User,
  Mail,
  Phone,
  FileText,
  MessageSquare,
  Clock,
  AlertCircle,
  Info,
  Settings,
  Search,
  Filter,
  Download,
  Upload,
  Copy,
  ExternalLink,
} from 'lucide-react';

export type IconName =
  | 'badge'
  | 'mixer'
  | 'speaker'
  | 'plate'
  | 'plane'
  | 'star'
  | 'cart'
  | 'check'
  | 'x'
  | 'arrow-right'
  | 'plus'
  | 'minus'
  | 'edit'
  | 'trash'
  | 'clipboard'
  | 'package'
  | 'calendar'
  | 'user'
  | 'mail'
  | 'phone'
  | 'file'
  | 'message'
  | 'clock'
  | 'alert'
  | 'info'
  | 'settings'
  | 'search'
  | 'filter'
  | 'download'
  | 'upload'
  | 'copy'
  | 'external-link';

interface GeometricIconProps {
  name: IconName;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const iconMap: Record<IconName, React.ComponentType<{ className?: string }>> = {
  badge: BadgeCheck,
  mixer: Sliders,
  speaker: Speaker,
  plate: UtensilsCrossed,
  plane: Plane,
  star: Star,
  cart: ShoppingCart,
  check: Check,
  x: X,
  'arrow-right': ChevronRight,
  plus: Plus,
  minus: Minus,
  edit: Edit,
  trash: Trash2,
  clipboard: ClipboardList,
  package: Package,
  calendar: Calendar,
  user: User,
  mail: Mail,
  phone: Phone,
  file: FileText,
  message: MessageSquare,
  clock: Clock,
  alert: AlertCircle,
  info: Info,
  settings: Settings,
  search: Search,
  filter: Filter,
  download: Download,
  upload: Upload,
  copy: Copy,
  'external-link': ExternalLink,
};

const sizeClasses = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
  xl: 'h-8 w-8',
};

export const GeometricIcon: React.FC<GeometricIconProps> = ({
  name,
  size = 'md',
  className,
}) => {
  const Icon = iconMap[name];

  if (!Icon) {
    console.warn(`Icon "${name}" not found in iconMap`);
    return null;
  }

  return <Icon className={cn(sizeClasses[size], className)} />;
};
