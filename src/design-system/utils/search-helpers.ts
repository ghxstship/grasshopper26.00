/**
 * Search Helper Utilities
 * GHXSTSHIP Entertainment Platform Search & Filter
 */

export interface SearchResult<T> {
  item: T;
  score: number;
  matches: string[];
}

/**
 * Simple text search
 */
export function searchText(query: string, text: string): boolean {
  return text.toLowerCase().includes(query.toLowerCase());
}

/**
 * Search in multiple fields
 */
export function searchInFields<T extends Record<string, any>>(
  item: T,
  query: string,
  fields: Array<keyof T>
): boolean {
  const lowerQuery = query.toLowerCase();
  
  return fields.some(field => {
    const value = item[field];
    if (typeof value === 'string') {
      return value.toLowerCase().includes(lowerQuery);
    }
    if (Array.isArray(value)) {
      return value.some((v: unknown) => String(v).toLowerCase().includes(lowerQuery));
    }
    return String(value).toLowerCase().includes(lowerQuery);
  });
}

/**
 * Fuzzy search with scoring
 */
export function fuzzySearch<T extends Record<string, any>>(
  items: T[],
  query: string,
  fields: Array<keyof T>
): SearchResult<T>[] {
  if (!query) return items.map(item => ({ item, score: 1, matches: [] }));
  
  const results: SearchResult<T>[] = [];
  const lowerQuery = query.toLowerCase();
  
  items.forEach(item => {
    let score = 0;
    const matches: string[] = [];
    
    fields.forEach(field => {
      const value = String(item[field]).toLowerCase();
      
      if (value === lowerQuery) {
        score += 10;
        matches.push(String(field));
      } else if (value.startsWith(lowerQuery)) {
        score += 5;
        matches.push(String(field));
      } else if (value.includes(lowerQuery)) {
        score += 2;
        matches.push(String(field));
      } else {
        // Check for fuzzy match
        const fuzzyScore = calculateFuzzyScore(lowerQuery, value);
        if (fuzzyScore > 0.5) {
          score += fuzzyScore;
          matches.push(String(field));
        }
      }
    });
    
    if (score > 0) {
      results.push({ item, score, matches });
    }
  });
  
  return results.sort((a, b) => b.score - a.score);
}

/**
 * Calculate fuzzy match score
 */
function calculateFuzzyScore(query: string, text: string): number {
  let score = 0;
  let queryIndex = 0;
  
  for (let i = 0; i < text.length && queryIndex < query.length; i++) {
    if (text[i] === query[queryIndex]) {
      score++;
      queryIndex++;
    }
  }
  
  return queryIndex === query.length ? score / text.length : 0;
}

/**
 * Highlight search matches
 */
export function highlightMatches(text: string, query: string): string {
  if (!query) return text;
  
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

/**
 * Filter by date range
 */
export function filterByDateRange<T extends { date: Date | string }>(
  items: T[],
  startDate?: Date,
  endDate?: Date
): T[] {
  return items.filter(item => {
    const itemDate = typeof item.date === 'string' ? new Date(item.date) : item.date;
    
    if (startDate && itemDate < startDate) return false;
    if (endDate && itemDate > endDate) return false;
    
    return true;
  });
}

/**
 * Filter by price range
 */
export function filterByPriceRange<T extends { price: number }>(
  items: T[],
  minPrice?: number,
  maxPrice?: number
): T[] {
  return items.filter(item => {
    if (minPrice !== undefined && item.price < minPrice) return false;
    if (maxPrice !== undefined && item.price > maxPrice) return false;
    return true;
  });
}

/**
 * Filter by tags
 */
export function filterByTags<T extends { tags?: string[] }>(
  items: T[],
  selectedTags: string[]
): T[] {
  if (selectedTags.length === 0) return items;
  
  return items.filter(item => {
    if (!item.tags) return false;
    return selectedTags.some(tag => item.tags!.includes(tag));
  });
}

/**
 * Sort by relevance
 */
export function sortByRelevance<T>(results: SearchResult<T>[]): SearchResult<T>[] {
  return [...results].sort((a, b) => b.score - a.score);
}

/**
 * Sort by date
 */
export function sortByDate<T extends { date: Date | string }>(
  items: T[],
  order: 'asc' | 'desc' = 'desc'
): T[] {
  return [...items].sort((a, b) => {
    const dateA = typeof a.date === 'string' ? new Date(a.date) : a.date;
    const dateB = typeof b.date === 'string' ? new Date(b.date) : b.date;
    
    return order === 'asc'
      ? dateA.getTime() - dateB.getTime()
      : dateB.getTime() - dateA.getTime();
  });
}

/**
 * Sort by price
 */
export function sortByPrice<T extends { price: number }>(
  items: T[],
  order: 'asc' | 'desc' = 'asc'
): T[] {
  return [...items].sort((a, b) => {
    return order === 'asc' ? a.price - b.price : b.price - a.price;
  });
}

/**
 * Sort by name
 */
export function sortByName<T extends { name: string }>(
  items: T[],
  order: 'asc' | 'desc' = 'asc'
): T[] {
  return [...items].sort((a, b) => {
    const comparison = a.name.localeCompare(b.name);
    return order === 'asc' ? comparison : -comparison;
  });
}

/**
 * Paginate results
 */
export function paginate<T>(
  items: T[],
  page: number,
  pageSize: number
): {
  items: T[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
} {
  const totalPages = Math.ceil(items.length / pageSize);
  const currentPage = Math.max(1, Math.min(page, totalPages));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  
  return {
    items: items.slice(startIndex, endIndex),
    totalPages,
    currentPage,
    totalItems: items.length,
  };
}

/**
 * Get unique values from field
 */
export function getUniqueValues<T extends Record<string, any>>(
  items: T[],
  field: keyof T
): any[] {
  const values = new Set<any>();
  
  items.forEach(item => {
    const value = item[field];
    if (Array.isArray(value)) {
      value.forEach((v: unknown) => values.add(v));
    } else {
      values.add(value);
    }
  });
  
  return Array.from(values);
}

/**
 * Create search index
 */
export class SearchIndex<T extends Record<string, any>> {
  private index: Map<string, Set<number>> = new Map();
  private items: T[] = [];
  private fields: Array<keyof T>;

  constructor(items: T[], fields: Array<keyof T>) {
    this.items = items;
    this.fields = fields;
    this.buildIndex();
  }

  private buildIndex(): void {
    this.items.forEach((item, index) => {
      this.fields.forEach(field => {
        const value = String(item[field]).toLowerCase();
        const words = value.split(/\s+/);
        
        words.forEach(word => {
          if (!this.index.has(word)) {
            this.index.set(word, new Set());
          }
          this.index.get(word)!.add(index);
        });
      });
    });
  }

  search(query: string): T[] {
    const words = query.toLowerCase().split(/\s+/);
    const resultIndices = new Set<number>();
    
    words.forEach(word => {
      const indices = this.index.get(word);
      if (indices) {
        indices.forEach(index => resultIndices.add(index));
      }
    });
    
    return Array.from(resultIndices).map(index => this.items[index]);
  }

  update(items: T[]): void {
    this.items = items;
    this.index.clear();
    this.buildIndex();
  }
}

/**
 * Create filter state manager
 */
export function createFilterState<T>() {
  let filters: Record<string, any> = {};
  
  return {
    setFilter: (key: string, value: any) => {
      filters[key] = value;
    },
    
    removeFilter: (key: string) => {
      delete filters[key];
    },
    
    clearFilters: () => {
      filters = {};
    },
    
    getFilters: () => ({ ...filters }),
    
    applyFilters: (items: T[], filterFunctions: Record<string, (items: T[], value: any) => T[]>) => {
      let filtered = items;
      
      Object.entries(filters).forEach(([key, value]) => {
        if (filterFunctions[key]) {
          filtered = filterFunctions[key](filtered, value);
        }
      });
      
      return filtered;
    },
  };
}

/**
 * Debounce search input
 */
export function debounceSearch(
  callback: (query: string) => void,
  delay: number = 300
): (query: string) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (query: string) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => callback(query), delay);
  };
}

/**
 * Get search suggestions
 */
export function getSearchSuggestions<T extends Record<string, any>>(
  items: T[],
  query: string,
  field: keyof T,
  limit: number = 5
): string[] {
  if (!query) return [];
  
  const lowerQuery = query.toLowerCase();
  const suggestions = new Set<string>();
  
  items.forEach(item => {
    const value = String(item[field]);
    if (value.toLowerCase().startsWith(lowerQuery)) {
      suggestions.add(value);
    }
  });
  
  return Array.from(suggestions).slice(0, limit);
}

/**
 * Format search query for display
 */
export function formatSearchQuery(query: string): string {
  return query.trim().toUpperCase();
}

/**
 * Get search result count message
 */
export function getSearchResultMessage(count: number, query: string): string {
  if (count === 0) {
    return `NO RESULTS FOUND FOR "${formatSearchQuery(query)}"`;
  }
  
  return `${count} RESULT${count !== 1 ? 'S' : ''} FOR "${formatSearchQuery(query)}"`;
}
