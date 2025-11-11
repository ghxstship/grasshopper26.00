'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { NewsCard } from '@/design-system/components/molecules/NewsCard/NewsCard';
import { SearchBar } from '@/design-system/components/molecules/SearchBar/SearchBar';
import { Select } from '@/design-system/components/atoms/Select/Select';
import { Typography } from '@/design-system/components/atoms/Typography/Typography';
import { Skeleton } from '@/design-system/components/atoms/Skeleton/Skeleton';
import { FilterBar } from '@/design-system/components/molecules/FilterBar/FilterBar';
import styles from './news.module.css';

interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  image_url?: string;
  published_at: string;
  author?: string;
  category?: string;
}

export function NewsBrowseClient({ initialArticles, initialSearch }: { initialArticles: NewsArticle[]; initialSearch?: string }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState(initialSearch || '');
  const [sortBy, setSortBy] = useState('date-desc');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Get unique categories
  const allCategories = Array.from(
    new Set(initialArticles.map(a => a.category).filter(Boolean))
  ).sort() as string[];

  const categoryFilters = allCategories.map(category => ({
    id: category,
    label: category,
    count: initialArticles.filter(a => a.category === category).length,
  }));

  // Filter and sort articles
  let filteredArticles = initialArticles.filter(article => {
    const matchesSearch = searchQuery
      ? article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    
    const matchesCategory = selectedCategories.length === 0 ||
      (article.category && selectedCategories.includes(article.category));
    
    return matchesSearch && matchesCategory;
  });

  // Sort articles
  filteredArticles = [...filteredArticles].sort((a, b) => {
    const dateA = new Date(a.published_at).getTime();
    const dateB = new Date(b.published_at).getTime();
    
    switch (sortBy) {
      case 'date-desc':
        return dateB - dateA;
      case 'date-asc':
        return dateA - dateB;
      case 'title-asc':
        return a.title.localeCompare(b.title);
      case 'title-desc':
        return b.title.localeCompare(a.title);
      default:
        return 0;
    }
  });

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(c => c !== categoryId)
        : [...prev, categoryId]
    );
  };

  const sortOptions = [
    { value: 'date-desc', label: 'Newest First' },
    { value: 'date-asc', label: 'Oldest First' },
    { value: 'title-asc', label: 'Title (A-Z)' },
    { value: 'title-desc', label: 'Title (Z-A)' },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Typography variant="h1" as="h1">
          Latest News
        </Typography>
        <Typography variant="body" as="p" className={styles.description}>
          Stay informed with the latest from GVTEWAY
        </Typography>
      </div>

      <div className={styles.controls}>
        <SearchBar
          placeholder="Search news..."
          value={searchQuery}
          onChange={setSearchQuery}
          fullWidth
        />
        <Select
          options={sortOptions}
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          label="Sort By"
          selectSize="md"
        />
      </div>

      {categoryFilters.length > 0 && (
        <div className={styles.filters}>
          <FilterBar
            filters={categoryFilters}
            selectedFilters={selectedCategories}
            onFilterChange={handleCategoryToggle}
            label="Categories"
          />
        </div>
      )}

      <div className={styles.results}>
        <Typography variant="body" as="p">
          Showing {filteredArticles.length} of {initialArticles.length} articles
        </Typography>
      </div>

      <div className={styles.grid}>
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} variant="rectangular" height="400px" />
          ))
        ) : filteredArticles.length > 0 ? (
          filteredArticles.map(article => (
            <NewsCard
              key={article.id}
              article={{
                id: article.id,
                title: article.title,
                excerpt: article.excerpt || '',
                imageUrl: article.image_url || '/placeholder.jpg',
                date: new Date(article.published_at).toLocaleDateString(),
                category: article.category,
                author: article.author,
              }}
              onClick={() => router.push(`/news/${article.slug}`)}
            />
          ))
        ) : (
          <div className={styles.emptyState}>
            <Typography variant="h3" as="p">
              No articles found
            </Typography>
            <Typography variant="body" as="p">
              Try adjusting your search or filters
            </Typography>
          </div>
        )}
      </div>
    </div>
  );
}
