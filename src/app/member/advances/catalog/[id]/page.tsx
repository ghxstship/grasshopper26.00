'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, X } from 'lucide-react';
import { GeometricShape } from '@/design-system';
import { QuantitySelector } from '@/design-system';
import { useAdvanceCart } from '@/contexts/AdvanceCartContext';
import { CatalogItem, CatalogItemModifier } from '@/lib/types/production-advances';
import { cn } from '@/lib/utils';
import styles from './page.module.css';

export default function CatalogItemDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { addItem } = useAdvanceCart();

  const [item, setItem] = useState<CatalogItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedModifiers, setSelectedModifiers] = useState<Record<string, string>>({});
  const [itemNotes, setItemNotes] = useState('');

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await fetch(`/api/catalog/${params.id}`);
        const data = await response.json();
        setItem(data.item);
      } catch (error) {
        console.error('Error fetching item:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchItem();
    }
  }, [params.id]);

  const handleModifierChange = (modifierId: string, value: string) => {
    setSelectedModifiers((prev) => ({
      ...prev,
      [modifierId]: value,
    }));
  };

  const handleAddToCart = () => {
    if (!item) return;

    const modifiers = Object.entries(selectedModifiers).map(([modifierId, value]) => {
      const modifier = item.modifiers?.find((m) => m.id === modifierId);
      return {
        modifier_id: modifierId,
        name: modifier?.name || '',
        value,
      };
    });

    addItem({
      catalog_item_id: item.id,
      name: item.name,
      category_name: item.category?.name || '',
      item_name: item.name,
      item_description: item.description,
      make: item.make,
      model: item.model,
      quantity,
      modifiers,
      notes: itemNotes || null,
      item_notes: itemNotes || null,
      thumbnail_url: item.thumbnail_url,
    });

    router.push('/advances/catalog');
  };

  if (loading) {
    return (
      <div className={styles.row}>
        <div className={styles.spinner} />
      </div>
    );
  }

  if (!item) {
    return (
      <div className={styles.emptyState}>
        <GeometricShape name="alert" size="xl" className={styles.emptyIcon} />
        <p className={styles.emptyText}>Item not found</p>
        <button
          type="button"
          onClick={() => router.push('/advances/catalog')}
          className={styles.emptyButton}
        >
          BACK TO CATALOG
        </button>
      </div>
    );
  }

  const isAvailable = (item.available_quantity ?? 0) > 0;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.headerSection}>
        <div className={styles.headerContainer}>
          <button
            type="button"
            onClick={() => router.push('/advances/catalog')}
            className={styles.backButton}
          >
            <ArrowLeft className={styles.icon} />
            BACK TO CATALOG
          </button>
        </div>
      </div>

      <div className={styles.mainContainer}>
        <div className={styles.grid}>
          {/* Left Column: Image */}
          <div className={styles.imageContainer}>
            {item.image_url ? (
              <Image
                src={item.image_url}
                alt={item.name}
                fill
                className={styles.grayscaleImage}
              />
            ) : (
              <div className={styles.imagePlaceholder}>
                <GeometricShape name="package" size="xl" className={styles.placeholderIcon} />
              </div>
            )}

            {/* Availability Badge */}
            <div className={styles.availabilityBadge}>
              {isAvailable ? (
                <div className={styles.badgeAvailable}>
                  <span className={cn(styles.badgeText, styles.badgeTextAvailable)}>
                    {item.available_quantity} AVAILABLE
                  </span>
                </div>
              ) : (
                <div className={styles.badgeUnavailable}>
                  <span className={cn(styles.badgeText, styles.badgeTextUnavailable)}>
                    UNAVAILABLE
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Details */}
          <div className={styles.detailsColumn}>
            {/* Item Header */}
            <div className={styles.itemHeader}>
              <h1 className={styles.itemTitle}>{item.name}</h1>
              {item.make && item.model && (
                <p className={styles.itemMeta}>
                  {item.make} {item.model}
                </p>
              )}
            </div>

            {/* Description */}
            {item.description && (
              <div className={styles.descriptionSection}>
                <p className={styles.descriptionText}>{item.description}</p>
              </div>
            )}

            {/* Specifications */}
            {item.specifications && Object.keys(item.specifications).length > 0 && (
              <div className={styles.specificationsSection}>
                <h3 className={styles.sectionTitle}>SPECIFICATIONS</h3>
                <dl className={styles.specsList}>
                  {Object.entries(item.specifications).map(([key, value]) => (
                    <div key={key} className={styles.specItem}>
                      <dt className={styles.specLabel}>
                        {key.replace(/_/g, ' ')}
                      </dt>
                      <dd className={styles.specValue}>{String(value)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {/* Quantity Selector */}
            <div className={styles.quantitySection}>
              <h3 className={styles.sectionTitle}>QUANTITY</h3>
              <QuantitySelector
                value={quantity}
                onChange={setQuantity}
                min={1}
                max={item.available_quantity ?? 1}
              />
            </div>

            {/* Modifiers */}
            {item.modifiers && item.modifiers.length > 0 && (
              <div className={styles.modifiersSection}>
                <h3 className={styles.sectionTitle}>CONFIGURE OPTIONS</h3>
                <div className={styles.section}>
                  {item.modifiers.map((modifier) => (
                    <div key={modifier.id} className={styles.modifierItem}>
                      <label className={styles.modifierLabel}>
                        {modifier.name}
                        {modifier.is_required && (
                          <span className={styles.requiredBadge}>
                            REQUIRED
                          </span>
                        )}
                      </label>
                      {modifier.description && (
                        <p className={styles.modifierDescription}>
                          {modifier.description}
                        </p>
                      )}

                      {modifier.options && modifier.options.length > 0 ? (
                        <div className={styles.optionsList}>
                          {modifier.options.map((option) => (
                            <label
                              key={option.id}
                              className={styles.optionLabel}
                            >
                              <input
                                type="radio"
                                name={modifier.id}
                                value={option.option_value}
                                checked={selectedModifiers[modifier.id] === option.option_value}
                                onChange={(e) => handleModifierChange(modifier.id, e.target.value)}
                                className={styles.optionRadio}
                              />
                              <span className={styles.optionText}>
                                {option.option_name}
                              </span>
                              {option.price_adjustment && option.price_adjustment > 0 && (
                                <span className={styles.optionPrice}>
                                  +${option.price_adjustment}
                                </span>
                              )}
                            </label>
                          ))}
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={selectedModifiers[modifier.id] || ''}
                          onChange={(e) => handleModifierChange(modifier.id, e.target.value)}
                          className={styles.modifierInput}
                          placeholder="Enter value..."
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Item Notes */}
            <div className={styles.notesSection}>
              <h3 className={styles.sectionTitle}>SPECIAL REQUESTS</h3>
              <textarea
                value={itemNotes}
                onChange={(e) => setItemNotes(e.target.value)}
                placeholder="Any special requests or notes for this item..."
                rows={4}
                className={styles.textarea}
              />
            </div>

            {/* Add to Cart Button */}
            <div className={styles.cartSection}>
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!isAvailable}
                className={cn(
                  styles.addButton,
                  isAvailable
                    ? styles.addButtonAvailable
                    : styles.addButtonDisabled
                )}
              >
                ADD TO ADVANCE ({quantity})
                <GeometricShape name="arrow-right" size="md" />
              </button>
            </div>

            {/* Tags */}
            {item.tags && item.tags.length > 0 && (
              <div className={styles.tagsSection}>
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className={styles.tag}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
