'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, DollarSign, MapPin, Filter, X } from 'lucide-react';

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
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="border-purple-500/30 hover:bg-purple-500/10"
      >
        <Filter className="mr-2 h-4 w-4" />
        Filters
        {activeFilterCount > 0 && (
          <span className="ml-2 bg-purple-600 text-white text-xs rounded-full px-2 py-0.5">
            {activeFilterCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <Card className="absolute top-12 right-0 z-50 w-80 bg-black/95 backdrop-blur-lg border-purple-500/20">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Filter Events</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Date Range */}
            <div>
              <Label className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-purple-400" />
                Date Range
              </Label>
              <div className="space-y-2">
                <Input
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  className="bg-black/50 border-purple-500/30"
                />
                <Input
                  type="date"
                  value={filters.dateTo || ''}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  className="bg-black/50 border-purple-500/30"
                />
              </div>
            </div>

            {/* Price Range */}
            <div>
              <Label className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-purple-400" />
                Price Range
              </Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.priceMin || ''}
                  onChange={(e) => handleFilterChange('priceMin', parseFloat(e.target.value))}
                  className="bg-black/50 border-purple-500/30"
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.priceMax || ''}
                  onChange={(e) => handleFilterChange('priceMax', parseFloat(e.target.value))}
                  className="bg-black/50 border-purple-500/30"
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <Label className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4 text-purple-400" />
                Location
              </Label>
              <Input
                type="text"
                placeholder="City or venue"
                value={filters.location || ''}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                className="bg-black/50 border-purple-500/30"
              />
            </div>

            {/* Category */}
            <div>
              <Label className="mb-2">Category</Label>
              <select
                value={filters.category || ''}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 bg-black/50 border border-purple-500/30 rounded-md text-white"
              >
                <option value="">All Categories</option>
                <option value="concert">Concert</option>
                <option value="festival">Festival</option>
                <option value="club">Club Night</option>
                <option value="theater">Theater</option>
              </select>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={clearFilters}
                className="flex-1 border-purple-500/30 hover:bg-purple-500/10"
              >
                Clear All
              </Button>
              <Button
                onClick={() => setIsOpen(false)}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
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
