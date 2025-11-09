'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, DollarSign, MapPin, Filter, X } from 'lucide-react';
import styles from './event-filters.module.css';

interface EventFiltersProps {
  onFilterChange: (filters: FilterState) => void;
}

export interface FilterState {
  dateFrom?: string;
  dateTo?: string;
  priceMin?: number;
  priceMax?: number;
  location?: string;
  category?: string;
}

export function EventFilters({ onFilterChange }: EventFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({});

  const handleFilterChange = (key: keyof FilterState, value: string | number) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    setFilters({});
    onFilterChange({});
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className={styles.container}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className={styles.filterButton}
      >
        <Filter className={styles.filterIcon} />
        Filters
        {activeFilterCount > 0 && (
          <span className={styles.badge}>
            {activeFilterCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <Card className={styles.card}>
          <CardHeader className={styles.cardHeader}>
            <CardTitle className="text-lg">Filter Events</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className={styles.closeButton}
            >
              <X className={styles.closeIcon} />
            </Button>
          </CardHeader>
          <CardContent className={styles.cardContent}>
            {/* Date Range */}
            <div className={styles.filterGroup}>
              <Label className={styles.label}>
                <Calendar className={styles.labelIcon} />
                Date Range
              </Label>
              <div className={styles.inputGroup}>
                <Input
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  className={styles.input}
                />
                <Input
                  type="date"
                  value={filters.dateTo || ''}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  className={styles.input}
                />
              </div>
            </div>

            {/* Price Range */}
            <div className={styles.filterGroup}>
              <Label className={styles.label}>
                <DollarSign className={styles.labelIcon} />
                Price Range
              </Label>
              <div className={styles.priceInputs}>
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.priceMin || ''}
                  onChange={(e) => handleFilterChange('priceMin', parseFloat(e.target.value))}
                  className={styles.input}
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.priceMax || ''}
                  onChange={(e) => handleFilterChange('priceMax', parseFloat(e.target.value))}
                  className={styles.input}
                />
              </div>
            </div>

            {/* Location */}
            <div className={styles.filterGroup}>
              <Label className={styles.label}>
                <MapPin className={styles.labelIcon} />
                Location
              </Label>
              <Input
                type="text"
                placeholder="City or venue"
                value={filters.location || ''}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                className={styles.input}
              />
            </div>

            {/* Category */}
            <div className={styles.filterGroup}>
              <Label className={styles.label}>Category</Label>
              <select
                value={filters.category || ''}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className={styles.select}
              >
                <option value="">All Categories</option>
                <option value="concert">Concert</option>
                <option value="festival">Festival</option>
                <option value="club">Club Night</option>
                <option value="theater">Theater</option>
              </select>
            </div>

            <div className={styles.actions}>
              <Button
                variant="outline"
                onClick={clearFilters}
                className={styles.clearButton}
              >
                Clear All
              </Button>
              <Button
                onClick={() => setIsOpen(false)}
                className={styles.applyButton}
              >
                Apply
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
