import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action,
  className 
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4', className)}>
      <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 text-center max-w-sm mb-6">{description}</p>
      {action && (
        <Button onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}

interface EmptySearchResultsProps {
  searchTerm: string;
  onClear: () => void;
}

export function EmptySearchResults({ searchTerm, onClear }: EmptySearchResultsProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="text-center">
        <p className="text-lg font-medium text-gray-900 mb-2">
          No results found for &quot;{searchTerm}&quot;
        </p>
        <p className="text-sm text-gray-500 mb-4">
          Try adjusting your search or filters
        </p>
        <Button onClick={onClear} variant="outline">
          Clear Search
        </Button>
      </div>
    </div>
  );
}

export function EmptyList({ 
  title, 
  description 
}: { 
  title: string; 
  description: string; 
}) {
  return (
    <div className="text-center py-12 px-4">
      <p className="text-lg font-medium text-gray-900 mb-2">{title}</p>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  );
}
