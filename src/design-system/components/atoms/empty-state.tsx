import { LucideIcon } from 'lucide-react';
import { Button } from '@/design-system/components/atoms/button';
import { cn } from '@/lib/utils';
import styles from './empty-state.module.css';

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
      <div className={styles.iconLarge}>
        <Icon className={styles.iconLarge} />
      </div>
      <h3 className={styles.text}>{title}</h3>
      <p className={styles.text}>{description}</p>
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
    <div className={styles.row}>
      <div className={styles.container}>
        <p className={styles.text}>
          No results found for &quot;{searchTerm}&quot;
        </p>
        <p className={styles.text}>
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
    <div className={styles.emptyState}>
      <p className={styles.text}>{title}</p>
      <p className={styles.text}>{description}</p>
    </div>
  );
}
