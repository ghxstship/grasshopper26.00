'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, X } from 'lucide-react';
import { GeometricIcon } from '@/design-system/components/atoms/GeometricIcon';
import { QuantitySelector } from '@/design-system/components/atoms/QuantitySelector';
import { useAdvanceCart } from '@/contexts/AdvanceCartContext';
import { CatalogItem, CatalogItemModifier } from '@/lib/types/production-advances';
import { cn } from '@/lib/utils';

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
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin border-4 border-black border-t-transparent" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <GeometricIcon name="alert" size="xl" className="mb-4 text-grey-400" />
        <p className="font-share-tech text-grey-700">Item not found</p>
        <button
          type="button"
          onClick={() => router.push('/advances/catalog')}
          className="mt-4 border-3 border-black bg-white px-6 py-3 font-bebas-neue uppercase transition-colors hover:bg-black hover:text-white"
        >
          BACK TO CATALOG
        </button>
      </div>
    );
  }

  const isAvailable = (item.available_quantity ?? 0) > 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b-3 border-black bg-white">
        <div className="container mx-auto px-4 py-6">
          <button
            type="button"
            onClick={() => router.push('/advances/catalog')}
            className="flex items-center gap-2 font-bebas-neue uppercase transition-colors hover:text-grey-600"
          >
            <ArrowLeft className="h-5 w-5" />
            BACK TO CATALOG
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left Column: Image */}
          <div className="relative aspect-square overflow-hidden border-3 border-black bg-grey-100">
            {item.image_url ? (
              <Image
                src={item.image_url}
                alt={item.name}
                fill
                className="object-cover grayscale"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <GeometricIcon name="package" size="xl" className="text-grey-400" />
              </div>
            )}

            {/* Availability Badge */}
            <div className="absolute right-6 top-6">
              {isAvailable ? (
                <div className="border-2 border-white bg-black px-4 py-2">
                  <span className="font-share-tech-mono text-sm uppercase text-white">
                    {item.available_quantity} AVAILABLE
                  </span>
                </div>
              ) : (
                <div className="border-2 border-black bg-grey-400 px-4 py-2">
                  <span className="font-share-tech-mono text-sm uppercase text-black">
                    UNAVAILABLE
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Details */}
          <div className="flex flex-col">
            {/* Item Header */}
            <div className="border-b-2 border-grey-200 pb-6">
              <h1 className="font-anton text-4xl uppercase">{item.name}</h1>
              {item.make && item.model && (
                <p className="mt-2 font-share-tech-mono text-sm text-grey-600">
                  {item.make} {item.model}
                </p>
              )}
            </div>

            {/* Description */}
            {item.description && (
              <div className="border-b-2 border-grey-200 py-6">
                <p className="font-share-tech text-grey-700">{item.description}</p>
              </div>
            )}

            {/* Specifications */}
            {item.specifications && Object.keys(item.specifications).length > 0 && (
              <div className="border-b-2 border-grey-200 py-6">
                <h3 className="mb-4 font-bebas-neue text-xl uppercase">SPECIFICATIONS</h3>
                <dl className="grid gap-3">
                  {Object.entries(item.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <dt className="font-share-tech-mono text-xs uppercase text-grey-600">
                        {key.replace(/_/g, ' ')}
                      </dt>
                      <dd className="font-share-tech text-sm text-grey-900">{String(value)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="border-b-2 border-grey-200 py-6">
              <h3 className="mb-4 font-bebas-neue text-xl uppercase">QUANTITY</h3>
              <QuantitySelector
                value={quantity}
                onChange={setQuantity}
                min={1}
                max={item.available_quantity ?? 1}
              />
            </div>

            {/* Modifiers */}
            {item.modifiers && item.modifiers.length > 0 && (
              <div className="border-b-2 border-grey-200 py-6">
                <h3 className="mb-4 font-bebas-neue text-xl uppercase">CONFIGURE OPTIONS</h3>
                <div className="space-y-6">
                  {item.modifiers.map((modifier) => (
                    <div key={modifier.id}>
                      <label className="mb-2 flex items-center gap-2 font-share-tech-mono text-sm uppercase">
                        {modifier.name}
                        {modifier.is_required && (
                          <span className="border-2 border-black bg-black px-2 py-0.5 text-[10px] text-white">
                            REQUIRED
                          </span>
                        )}
                      </label>
                      {modifier.description && (
                        <p className="mb-3 font-share-tech text-xs text-grey-600">
                          {modifier.description}
                        </p>
                      )}

                      {modifier.options && modifier.options.length > 0 ? (
                        <div className="space-y-2">
                          {modifier.options.map((option) => (
                            <label
                              key={option.id}
                              className="flex cursor-pointer items-center gap-3 border-2 border-grey-300 bg-white p-3 transition-colors hover:border-black"
                            >
                              <input
                                type="radio"
                                name={modifier.id}
                                value={option.option_value}
                                checked={selectedModifiers[modifier.id] === option.option_value}
                                onChange={(e) => handleModifierChange(modifier.id, e.target.value)}
                                className="h-4 w-4"
                              />
                              <span className="flex-1 font-share-tech text-sm">
                                {option.option_name}
                              </span>
                              {option.price_adjustment && option.price_adjustment > 0 && (
                                <span className="font-share-tech-mono text-xs text-grey-600">
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
                          className="w-full border-3 border-black bg-white px-4 py-3 font-share-tech outline-none focus:border-grey-800"
                          placeholder="Enter value..."
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Item Notes */}
            <div className="border-b-2 border-grey-200 py-6">
              <h3 className="mb-4 font-bebas-neue text-xl uppercase">SPECIAL REQUESTS</h3>
              <textarea
                value={itemNotes}
                onChange={(e) => setItemNotes(e.target.value)}
                placeholder="Any special requests or notes for this item..."
                rows={4}
                className="w-full border-3 border-black bg-white px-4 py-3 font-share-tech outline-none focus:border-grey-800"
              />
            </div>

            {/* Add to Cart Button */}
            <div className="pt-6">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!isAvailable}
                className={cn(
                  'flex w-full items-center justify-center gap-3 border-3 px-6 py-4',
                  'font-bebas-neue text-lg uppercase transition-colors',
                  isAvailable
                    ? 'border-black bg-black text-white hover:bg-white hover:text-black'
                    : 'cursor-not-allowed border-grey-400 bg-grey-300 text-grey-600'
                )}
              >
                ADD TO ADVANCE ({quantity})
                <GeometricIcon name="arrow-right" size="md" />
              </button>
            </div>

            {/* Tags */}
            {item.tags && item.tags.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="border-2 border-black px-3 py-1 font-share-tech-mono text-xs uppercase"
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
