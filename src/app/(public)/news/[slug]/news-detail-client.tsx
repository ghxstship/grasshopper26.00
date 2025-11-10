'use client';

import { DetailViewTemplate } from '@/design-system/components/templates';
import { Calendar, User } from 'lucide-react';
import { format } from 'date-fns';

export function NewsDetailClient({ article }: { article: any }) {
  return (
    <DetailViewTemplate
      breadcrumbs={[
        { label: 'News', href: '/news' },
        { label: article.title, href: `/news/${article.slug}` },
      ]}
      heroImage={article.image_url}
      title={article.title}
      subtitle={article.excerpt}
      sidebar={
        <div>
          <h3>Article Info</h3>
          <div><Calendar /> {format(new Date(article.published_at), 'PPP')}</div>
          {article.author && <div><User /> {article.author}</div>}
        </div>
      }
    >
      <div dangerouslySetInnerHTML={{ __html: article.content }} />
    </DetailViewTemplate>
  );
}
