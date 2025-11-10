'use client';

import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import styles from './news-card.module.css';

export function NewsCard({ article }: { article: any }) {
  return (
    <Link href={`/news/${article.slug}`} className={styles.card}>
      <div className={styles.imageWrapper}>
        {article.image_url ? (
          <Image src={article.image_url} alt={article.title} fill className={styles.image} />
        ) : (
          <div className={styles.imagePlaceholder} />
        )}
      </div>
      <div className={styles.content}>
        <div className={styles.date}>{format(new Date(article.published_at), 'PPP')}</div>
        <h3 className={styles.title}>{article.title}</h3>
        {article.excerpt && <p className={styles.excerpt}>{article.excerpt}</p>}
      </div>
    </Link>
  );
}
