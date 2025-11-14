import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Spinner } from '@/design-system';
import styles from './page.module.css';

async function VenueDetails({ id }: { id: string }) {
  const supabase = await createClient();
  
  const { data: venue, error } = await supabase
    .from('venues')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !venue) notFound();

  return (
    <div className={styles.content}>
      <div className={styles.infoGrid}>
        <div className={styles.infoItem}>
          <span className={styles.label}>TYPE</span>
          <span className={styles.value}>{venue.venue_type?.toUpperCase().replace('_', ' ') || '-'}</span>
        </div>
        
        <div className={styles.infoItem}>
          <span className={styles.label}>MAX CAPACITY</span>
          <span className={styles.value}>{venue.max_capacity.toLocaleString()}</span>
        </div>

        <div className={styles.infoItem}>
          <span className={styles.label}>LOCATION</span>
          <span className={styles.value}>{venue.city}, {venue.state}</span>
        </div>

        <div className={styles.infoItem}>
          <span className={styles.label}>STATUS</span>
          <span className={`${styles.value} ${venue.is_active ? styles.active : styles.inactive}`}>
            {venue.is_active ? 'ACTIVE' : 'INACTIVE'}
          </span>
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>CONTACT INFORMATION</h3>
        <div className={styles.contactGrid}>
          {venue.primary_contact_name && (
            <div className={styles.contactItem}>
              <span className={styles.label}>CONTACT</span>
              <span className={styles.value}>{venue.primary_contact_name}</span>
            </div>
          )}
          {venue.primary_email && (
            <div className={styles.contactItem}>
              <span className={styles.label}>EMAIL</span>
              <a href={`mailto:${venue.primary_email}`} className={styles.link}>
                {venue.primary_email}
              </a>
            </div>
          )}
          {venue.primary_phone && (
            <div className={styles.contactItem}>
              <span className={styles.label}>PHONE</span>
              <a href={`tel:${venue.primary_phone}`} className={styles.link}>
                {venue.primary_phone}
              </a>
            </div>
          )}
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>CAPACITY BREAKDOWN</h3>
        <div className={styles.capacityGrid}>
          {venue.standing_capacity && (
            <div className={styles.capacityItem}>
              <span className={styles.label}>STANDING</span>
              <span className={styles.value}>{venue.standing_capacity.toLocaleString()}</span>
            </div>
          )}
          {venue.seated_capacity && (
            <div className={styles.capacityItem}>
              <span className={styles.label}>SEATED</span>
              <span className={styles.value}>{venue.seated_capacity.toLocaleString()}</span>
            </div>
          )}
          {venue.vip_capacity && (
            <div className={styles.capacityItem}>
              <span className={styles.label}>VIP</span>
              <span className={styles.value}>{venue.vip_capacity.toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>

      {(venue.has_green_rooms || venue.has_bar || venue.has_catering_kitchen) && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>AMENITIES</h3>
          <div className={styles.amenitiesList}>
            {venue.has_green_rooms && (
              <div className={styles.amenity}>
                ✓ GREEN ROOMS ({venue.green_room_count || 0})
              </div>
            )}
            {venue.has_bar && (
              <div className={styles.amenity}>
                ✓ BAR ({venue.bar_count || 0})
              </div>
            )}
            {venue.has_catering_kitchen && (
              <div className={styles.amenity}>
                ✓ CATERING KITCHEN
              </div>
            )}
            {venue.has_coat_check && (
              <div className={styles.amenity}>
                ✓ COAT CHECK
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default async function VenuePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  
  const { data: venue } = await supabase
    .from('venues')
    .select('venue_name')
    .eq('id', id)
    .single();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>{venue?.venue_name || 'VENUE'}</h1>
      </div>

      <Suspense fallback={<Spinner />}>
        <VenueDetails id={id} />
      </Suspense>
    </div>
  );
}
